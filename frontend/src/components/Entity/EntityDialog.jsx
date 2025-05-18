import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import EditEntityForm from './DialogForms/EditEntityForm';
import CopyEntityForm from './DialogForms/CopyEntityForm';
import CreateEntityForm from './DialogForms/CreateEntityForm';
import DeleteEntityForm from './DialogForms/DeleteEntityForm';
import ReportEntityForm from '../Report/DialogForms/ReportEntityForm';
import ChangeWarning from '../ChangeWarning';
import { useAuth } from '../../contexts/AuthContext';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import { sendAnalytics } from '../../utils/analytics';
import { useSearch } from '../../contexts/SearchContext';
import { useDefinitions } from '../../contexts/useDefinitions';
import { useEntities } from '../../contexts/useEntities';
import { useFormats } from '../../contexts/useFormats';
import { useAffectedItems } from '../../contexts/useAffectedItems';
import { generateSampleObject, determineRegexType } from '../../utils/clipboardUtils';
import { useTranslation } from 'react-i18next';

function EntityDialog({
  open,
  onClose,
  selectedNode,
  setSelectedNode,
  mode,
  fetchNodes,
}) {
  const [checkedFields, setCheckedFields] = useState([]);
  const { affected, fetchAffectedItems } = useAffectedItems();
  const { definitions, fetchDefinitions } = useDefinitions();
  const { formats } = useFormats();
  const { entities, fetchEntities } = useEntities();
  const { t } = useTranslation();
  const [newEntity, setNewEntity] = useState({ label: '', fields: [] });
  const [sureDelete, setSureDelete] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [report, setReport] = useState({ type: '', description: '' });
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem('token');



  // naming & validation
  const [namingConvention, setNamingConvention] = useState("");
  const [namingConventionError, setNamingConventionError] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNamingConvention(data.namingConvention);
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
      } else {
        console.error("Error fetching settings:", error);
        enqueueSnackbar(t("error_fetching_settings"), { variant: "error" });
      }
    }
  }, [logout, token, t]);

  useEffect(() => {
    fetchDefinitions();
    fetchEntities();
    fetchSettings();
  }, [fetchDefinitions, fetchEntities, fetchSettings]);

  useEffect(() => {
    if (selectedNode && ['edit', 'delete'].includes(mode)) {
      fetchAffectedItems({ name: selectedNode.label, type: 'entity' });
    }
  }, [selectedNode, mode, fetchAffectedItems]);
  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  // Handle the dialog action based on the current mode.
  const handleAction = useCallback(async () => {
    try {
      let response;
      const headers = { Authorization: `Bearer ${token}` };

      switch (mode) {
        case 'edit':
          response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/entities/${selectedNode.label}`,
            selectedNode,
            { headers }
          );
          break;

        case 'create':
          if (!namingConvention) return true;
          const { label } = newEntity;
          switch (namingConvention) {
            case 'snake_case':
              if (!/^[a-z0-9_]+$/.test(label)) {
                setNamingConventionError(
                  `${t('definitions.bad_naming_convention')} ${t('common.snake_case')}`
                );
                return;
              }
              break;
            case 'camelCase':
              if (!/^[a-z][a-zA-Z0-9]*$/.test(label)) {
                setNamingConventionError(
                  `${t('definitions.bad_naming_convention')} ${t('common.camel_case')}`
                );
                return;
              }
              break;
            case 'PascalCase':
              if (!/^[A-Z][a-zA-Z0-9]*$/.test(label)) {
                setNamingConventionError(
                  `${t('definitions.bad_naming_convention')} ${t('common.pascal_case')}`
                );
                return;
              }
              break;
            case 'kebab-case':
              if (!/^[a-z0-9-]+$/.test(label)) {
                setNamingConventionError(
                  `${t('definitions.bad_naming_convention')} ${t('common.kebab_case')}`
                );
                return;
              }
              break;
            default:
              setNamingConventionError('');
          }
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/entities`, newEntity, { headers });
          break;

        case 'delete':
          response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/entities/${selectedNode.label}`, { headers });
          setSureDelete(false);
          break;

        case 'report':
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/${selectedNode.label}`, report, { headers });
          break;

        default:
          return;
      }

      if (response?.status >= 200 && response?.status < 300) {
        enqueueSnackbar(`${mode !== 'edit' ? t(`common.${mode}d`) : t(`common.${mode}ed`)} ${t(`common.successfully`)}`, { variant: 'success' });
        await fetchEntities();
        fetchNodes();
        setNewEntity({ label: '', fields: [] });
      }

      setRefreshSearchables((prev) => prev + 1);
      onClose();
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: 'bad_token' });
        onClose();
        return;
      } else if (error.response?.status === 409) {
        enqueueSnackbar(t('entity_already_exists'), { variant: 'error' });
      } else {
        console.error(`Error ${mode}ing entity:`, error);
        enqueueSnackbar(`${t('common.error')} ${t(`common.${mode}ing`)} ${t('common.entity')}`, { variant: 'error' });
      }
    }
  }, [mode, selectedNode, fetchNodes, token, logout, setRefreshSearchables, onClose, newEntity, fetchEntities, report, t]);

  function processField(field) {
    // For a field from definitions:
    if (field.type === 'definition') {
      const def = definitions[field.label];
      if (!def) {
        console.error(`Definition for ${field.label} not found`);
        return null;
      }
      const formatPattern = formats[def.format]?.pattern || 'Pattern not found';
      const description = def.description || 'No description available';
      const regexType = determineRegexType(formatPattern);
      // (Analytics can be sent here if desired)
      sendAnalytics(field.label, 'definition', 1);
      sendAnalytics(formatPattern, 'format', 1);
      return {
        name: field.label,
        type: regexType,
        format: formatPattern,
        description: description,
      };
    }
    // For a field that is an entity:
    else if (field.type === 'entity') {
      const entity = entities[field.label];
      if (!entity) {
        console.error(`Entity ${field.label} not found`);
        return { name: field.label, type: 'entity', fields: [] };
      }
      sendAnalytics(field.label, 'entity', 1);
      // Process the nested fields recursively:
      const nestedFields = entity.fields
        .map(processField)
        .filter((item) => item !== null); // remove any errors
      return {
        name: field.label,
        type: 'entity',
        fields: nestedFields,
      };
    }
    // In case you have other types:
    else {
      console.error(`Unknown field type for ${field.label}`);
      return null;
    }
  }

  // Helper: Generates an HTML table for an array of processed fields.
  // Assumes every field in data has a similar shape.
  function generateHtmlTable(entityLabel, data) {
    if (!data || data.length === 0) return '';

    // Determine headers dynamically from the first row
    const headers = ['name', 'type', 'format', 'description'];

    // Use inline CSS for a modern table style
    let html = `
    <h3 style="font-family: Arial, sans-serif; color: #333;">${entityLabel}</h3>
    <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; color: #333;">
      <thead>
        <tr>
  `;

    // Reverse headers order if desired (or keep as is)
    headers.slice().reverse().forEach((header) => {
      html += `<th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2; text-align: right;">${header}</th>`;
    });

    html += `
        </tr>
      </thead>
      <tbody>
  `;

    data.forEach((row, rowIndex) => {
      // Optional: add alternating row colors for readability
      const rowStyle = rowIndex % 2 === 0 ? 'background-color: #fff;' : 'background-color: #fafafa;';
      html += `<tr style="${rowStyle}">`;

      headers.slice().reverse().forEach((header) => {
        let cellData = row[header];

        if (Array.isArray(cellData)) {
          // For arrays, join the string representations of each field.
          cellData = cellData
            .map((field) => {
              if (field.type === 'entity') {
                // Mark nested entity with its name; its full table will be appended later.
                return `[Entity: ${field.name}]`;
              } else {
                return `${field.name}: ${field.format || ''}`;
              }
            })
            .join(', ');
        } else if (typeof cellData === 'object' && cellData !== null) {
          // For definition objects
          cellData = `${cellData.type}: ${cellData.format || ''}`;
        }

        cellData = (cellData !== null && cellData !== undefined)
          ? (cellData === 'entity' ? 'object' : cellData)
          : '';

        html += `<td style="border: 1px solid #ccc; padding: 8px;">${cellData}</td>`;
      });

      html += '</tr>';
    });

    html += `
      </tbody>
    </table>
  `;

    return html;
  }


  // Helper: Recursively generate tables for any entity fields found
  function generateNestedEntityTables(data) {
    let nestedTablesHtml = '';

    data.forEach((field) => {
      if (field.type === 'entity' && field.fields && field.fields.length > 0) {
        // Generate table for the nested entity.
        nestedTablesHtml += generateHtmlTable(field.name, field.fields);
        // Recursively check for deeper nested entities
        nestedTablesHtml += generateNestedEntityTables(field.fields);
      }
    });

    return nestedTablesHtml;
  }

  function convertFieldsToObject(fields) {
    return fields.reduce((acc, field) => {
      if (field.type === 'entity') {
        // For entity fields, recursively convert their nested fields
        acc[field.name] = convertFieldsToObject(field.fields);
      } else {
        // For definition fields, assign the object as is.
        acc[field.name] = {
          type: field.type,
          format: field.format,
          description: field.description,
        };
      }
      return acc;
    }, {});
  }

  const handleCopyClick = async ({ entity, selectedData, type }) => {
    // Process the selected fields. Each field might be a definition or an entity.
    sendAnalytics(entity.label, 'entity', 1);
    const data = selectedData
      .map(processField)
      .filter((item) => item !== null);

    if (!data || data.length === 0) {
      return;
    }

    if (type === 'object') {
      const entityData = convertFieldsToObject(data);

      const clipBoardData = JSON.stringify(entityData, null, 2);
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([clipBoardData], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar(t('common.copied'), { variant: 'success' });
    } else if (type === 'table') {
      try {
        // Generate main table HTML for the top-level entity
        let htmlTable = generateHtmlTable(entity.label, data);
        // Now, for any entity fields, append their own tables below.
        htmlTable += generateNestedEntityTables(data);

        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        // Also create a plain text version by stripping HTML tags
        const blobText = new Blob([htmlTable.replace(/<\/?[^>]+(>|$)/g, '')], { type: 'text/plain' });

        const clipboardItems = [
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ];

        await navigator.clipboard.write(clipboardItems);
        enqueueSnackbar(t('common.copied'), { variant: 'success' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        enqueueSnackbar(t('common.copy_failed'), { variant: 'error' });
      }
    } else if (type === 'example') {
      const sampleData = generateSampleObject(data);
      const clipboardRawData = {
        [entity.label]: sampleData,
      };
      const clipBoardData = JSON.stringify(clipboardRawData, null, 2);
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([clipBoardData], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      enqueueSnackbar(t('common.copied'), { variant: 'success' });
    }
  };


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {mode && t(`common.${mode}ing`)} {mode !== 'create' ? selectedNode?.label : t('common.entity')}
        {affected && ['edit', 'delete'].includes(mode) && (
          <ChangeWarning items={affected} level={mode === 'edit' ? 'warning' : 'error'} />
        )}
      </DialogTitle>
      <DialogContent>
        {mode === 'edit' && <EditEntityForm node={selectedNode} setNode={setSelectedNode} />}
        {mode === 'copy' && <CopyEntityForm node={selectedNode} onCheckChange={setCheckedFields} />}
        {mode === 'create' && <CreateEntityForm newEntity={newEntity} setNewEntity={setNewEntity} namingConventionError={namingConventionError} />}
        {mode === 'delete' && (
          <DeleteEntityForm
            node={selectedNode}
            sureDelete={sureDelete}
            setSureDelete={setSureDelete}
            onDelete={handleAction}
            onCancel={onClose}
          />
        )}
        {mode === 'report' && <ReportEntityForm node={selectedNode} report={report} setReport={setReport} />}
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            textTransform: 'capitalize',
          }}
          onClick={onClose}>{t('common.cancel')}</Button>
        {mode !== 'copy' ? <Button
          onClick={handleAction}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'capitalize',
          }}
          disabled={
            (mode === 'create' && (!newEntity.label || newEntity.fields.some((f) => !f.label))) ||
            (mode === 'edit' && selectedNode.fields.some((f) => !f.label)) ||
            (mode === 'delete' && !sureDelete)
          }
        >
          {t(`common.${mode}`)}
        </Button> :
          <Box>
            <Button variant="contained" color="primary" onClick={handleMenuOpen} disabled={checkedFields.length === 0} sx={{
              textTransform: 'capitalize',
            }}>
              {t('common.copy')}
            </Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              {['table', 'object', 'example'].map((type) => (
                <MenuItem key={type} onClick={() => handleCopyClick({ entity: selectedNode, selectedData: checkedFields, type })}>
                  {t('common.copy_as')} {t(`common.${type}`)}
                </MenuItem>
              ))}
            </Menu>
          </Box>}
      </DialogActions>
    </Dialog>
  );
}

export default EntityDialog;
