import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Box, Tooltip, Typography, MenuItem, Button, Menu } from '@mui/material';
import { Trash2 as Trash, Pencil, Copy, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { sendAnalytics } from '../utils/analytics';
import { useSearch } from '../contexts/SearchContext';
import { useFormats } from '../contexts/useFormats';
import { generateSampleObject, determineRegexType } from '../utils/clipboardUtils'; // Assuming you have a utility function for generating sample objects

function CustomDataGrid({ rows, columns, handleDeleteRow, handleEditRow, handleReportRow, type }) {
  const { auth } = useAuth();
  const { t, i18n } = useTranslation();
  const { search, setSearch } = useSearch();
  const { formats } = useFormats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionModel, setSelectionModel] = useState([]);
  const [copyMenuAnchor, setCopyMenuAnchor] = useState(null);


  // Fetch locale dynamically based on language
  const [locale, setLocale] = useState(undefined);

  useEffect(() => {
    const loadLocale = async () => {
      const locales = {
        he: () => import('@mui/x-data-grid/locales').then((m) => m.heIL.components.MuiDataGrid.defaultProps.localeText),
        ar: () => import('@mui/x-data-grid/locales').then((m) => m.arSD.components.MuiDataGrid.defaultProps.localeText),
        de: () => import('@mui/x-data-grid/locales').then((m) => m.deDE.components.MuiDataGrid.defaultProps.localeText),
        es: () => import('@mui/x-data-grid/locales').then((m) => m.esES.components.MuiDataGrid.defaultProps.localeText),
        fr: () => import('@mui/x-data-grid/locales').then((m) => m.frFR.components.MuiDataGrid.defaultProps.localeText),
      };
      setLocale(await (locales[i18n.language] || (() => Promise.resolve(undefined)))());
    };
    loadLocale();
  }, [i18n.language]);

  useEffect(() => {
    if (search) {
      setSearchTerm(search);
      setSearch('');
    }
  }, [search, setSearch]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);



  const handleMultiCopy = useCallback(
    async (mode) => {
      // 1️⃣ gather the selected row objects
      const selectedRows = selectionModel
        .map((id) => rows.find((row) => row.id === id))
        .filter(Boolean);

      if (selectedRows.length === 0) {
        enqueueSnackbar(t('common.nothing_selected'), { variant: 'warning' });
        return;
      }

      let clipboardItems;

      if (mode === 'table') {
        const headerCells = columns
          .flatMap((col) =>
            col.field === 'format'
              ? [
                `<th style="border:1px solid #ddd;padding:8px;">${t('common.type')}</th>`,
                `<th style="border:1px solid #ddd;padding:8px;">${col.headerName}</th>`,
              ]
              : [`<th style="border:1px solid #ddd;padding:8px;">${col.headerName}</th>`]
          )
          .join('');

        let html = `
      <table dir="ltr" style="border-collapse:collapse;width:100%">
        <thead style="background:#f2f2f2">
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
    `;

        // 2️⃣ For each row, emit a <td> for every column – but split "format" into [type, pattern]
        selectedRows.forEach((row) => {
          const rowCells = columns
            .flatMap((col) => {
              if (col.field === 'format') {
                const pattern = formats[row.format]?.pattern || '';
                const type = determineRegexType(pattern);
                return [
                  `<td style="border:1px solid #ddd;padding:8px;">${type}</td>`,
                  `<td style="border:1px solid #ddd;padding:8px;">${pattern}</td>`,
                ];
              }
              return [
                `<td style="border:1px solid #ddd;padding:8px;">${row[col.field] ?? ''}</td>`,
              ];
            })
            .join('');
          html += `<tr>${rowCells}</tr>`;
        });

        html += `</tbody></table>`;

        // 3️⃣ Copy to clipboard as HTML + plaintext
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([html.replace(/<\/?[^>]+(>|$)/g, '')], {
          type: 'text/plain',
        });
        clipboardItems = [
          new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText }),
        ];
      } else if (mode === 'object') {
        // JSON array of row-objects (sans id)
        const data = selectedRows.map((row) => {
          const obj = {};
          columns.forEach((col) => {
            if (col.field !== 'id') obj[col.field] = row[col.field];
          });
          return obj;
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        clipboardItems = [new ClipboardItem({ 'text/plain': blob })];
      } else {
        // example: generate sample object per definition schema
        const schema = selectedRows.map((row) => {
          const pattern = formats[row.format]?.pattern || '';
          return {
            name: row.id,
            type: determineRegexType(pattern),
            format: pattern,
            description: row.description || '',
          };
        });
        const sample = generateSampleObject(schema);
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'text/plain' });
        clipboardItems = [new ClipboardItem({ 'text/plain': blob })];
      }

      await navigator.clipboard.write(clipboardItems);
      enqueueSnackbar(t('common.copied'), { variant: 'success' });
      sendAnalytics(selectionModel.join(','), type, 1);
    },
    [selectionModel, rows, columns, formats, t, type],
  );

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      columns.some((col) => String(row[col.field] || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rows, columns, searchTerm]);


  const columnsWithCopy = useMemo(() => {
    const baseColumns = columns.map((col) => ({
      ...col,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, justifyContent: "center", mt: 1.5, }}>
          {params.value && (
            <Tooltip title="Copy" arrow>
              <Copy
                style={{ cursor: 'pointer', minWidth: '16px', minHeight: '16px' }}
                size={16}
                onClick={() => {
                  navigator.clipboard.writeText(params.value);
                  enqueueSnackbar('Copied to clipboard', { variant: 'success' });
                  sendAnalytics(params.row.id, type, 1);
                }}
              />
            </Tooltip>
          )}
          <Typography
            variant="subtitle2"
            sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {params.value || null}
          </Typography>
        </Box>
      ),
    }));

    const enhancedColumns = baseColumns.map((col) =>
      col.field === 'format'
        ? {
          ...col,
          renderCell: (params) => {
            const formatPattern = formats[params.value]?.pattern || 'Pattern not found';
            return (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: "center",
                mt: 1.5,
                width: '100%',
                gap: 1,
              }}>
                {params.value && (
                  <Tooltip title="Copy" arrow>
                    <Copy
                      style={{ cursor: 'pointer', minWidth: '16px', minHeight: '16px' }}
                      size={16}
                      onClick={() => {
                        navigator.clipboard.writeText(params.value);
                        enqueueSnackbar(t('common.copied'), { variant: 'success' });
                        sendAnalytics(params.row.id, type, 1);
                      }}
                    />
                  </Tooltip>
                )}
                <Tooltip title={formatPattern}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: formatPattern === 'Pattern not found' ? 'red' : 'inherit',
                    }}
                  >
                    {params.value || null}
                  </Typography>
                </Tooltip>
              </Box>
            );
          },
        }
        : col
    );

    return [
      ...enhancedColumns,
      {
        field: 'actions',
        headerName: t('common.actions'),
        sortable: false,
        width: 80,
        disableColumnMenu: true,
        renderCell: (params) =>
          auth ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: "center", mt: 1.5, }}>
              <Tooltip title="Edit" arrow>
                <Pencil style={{ cursor: 'pointer' }} onClick={() => handleEditRow(params.row)} />
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <Trash style={{ cursor: 'pointer' }} onClick={() => handleDeleteRow(params.row)} />
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: "center", mt: 1.5, }}>
              <Flag style={{ cursor: 'pointer', fill: 'black' }} onClick={() => handleReportRow(params.row)} />
            </Box>
          ),
      },
    ];
  }, [columns, auth, t, handleEditRow, handleDeleteRow, handleReportRow, type, formats])
  return (
    <Box sx={{ mt: 0.5 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label={t('common.filter')}
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ maxWidth: 500 }}
        />
        {selectionModel.length > 0 && (
          <Box>
            <Button
              variant="outlined"
              onClick={(e) => setCopyMenuAnchor(e.currentTarget)}
              disabled={selectionModel.length === 0}
            >
              {t('common.copy')} ({selectionModel.length})
            </Button>
            <Menu
              anchorEl={copyMenuAnchor}
              open={Boolean(copyMenuAnchor)}
              onClose={() => setCopyMenuAnchor(null)}
            >
              {['table', 'object', 'example'].map((mode) => (
                <MenuItem
                  key={mode}
                  onClick={() => {
                    handleMultiCopy(mode);
                    setCopyMenuAnchor(null);
                  }}
                >
                  {t('common.copy_as')} {t(`common.${mode}`)}
                </MenuItem>
              ))}
            </Menu>
          </Box>)}
      </Box>
      <DataGrid
        rows={filteredRows}
        columns={columnsWithCopy}
        pageSize={10}
        rowsPerPageOptions={[50]}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        localeText={locale}
        isCellEditable={() => false}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(newSel) => setSelectionModel(newSel)}
        sx={{
          height: 'calc(100vh - 200px)',
          maxWidth: '100%',
          width: '100%',
          '& .MuiDataGrid-cell': { outline: 'none' },
        }}
        key={`${window.innerWidth}-${window.innerHeight}`}
      />
    </Box>
  );
}

export default CustomDataGrid;
