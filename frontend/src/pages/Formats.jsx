import React, { useMemo, useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import FormatDialog from '../components/FormatDialog';
import ReportDialog from '../components/ReportDialog';
import CustomDataGrid from '../components/CustomDataGrid';
import DeleteDialog from '../components/DeleteDialog';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useRtl } from '../contexts/RtlContext';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useFormats } from '../contexts/useFormats';

const Formats = () => {
  const { formats, fetchFormats } = useFormats();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const { auth, logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem('token');
  const { t } = useTranslation();
  const theme = useTheme();
  const { reverseWords } = useRtl();
  const rows = useMemo(() =>
    Object.entries(formats).map(([name, defData]) => ({
      id: name,
      name,
      pattern: defData.pattern,
      description: defData.description,
    })),
    [formats]
  );

  // Columns for the data grid
  const columns = useMemo(()=>[
    { field: 'name', headerName: t('common.name'), flex: 1 },
    {
      field: 'pattern',
      headerName: t('formats.pattern'),
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ mt: '3%' }} dir="ltr">
          {params.value}
        </Typography>
      ),
    },
    { field: 'description', headerName: t('common.description'), flex: 2 },
  ],[t]);



  // Handlers for opening dialogs.
  const openAddDialog = useCallback(() => {
    setDialogMode('add');
    setSelectedFormat(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((format) => {
    setDialogMode('edit');
    setSelectedFormat(format);
    setDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((format) => {
    setSelectedFormat(format);
    setDeleteDialogOpen(true);
  }, []);

  const openReportDialog = useCallback((format) => {
    setSelectedFormat(format);
    setReportDialogOpen(true);
  }, []);

  // Handlers for closing dialogs.
  const closeAddDialog = useCallback(() => {
    setDialogMode(null);
    setDialogOpen(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const closeReportDialog = useCallback(() => {
    setSelectedFormat(null);
    setReportDialogOpen(false);
  }, []);

  // Delete a format.
  const deleteFormat = useCallback(async (deletedFormat) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/formats/${deletedFormat.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFormats();
      enqueueSnackbar('Format deleted successfully', { variant: 'success' });
      closeDeleteDialog();
      setSelectedFormat(null);
      setRefreshSearchables((prev) => prev + 1);
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: 'bad_token' });
        return;
      }
      console.error('Error deleting format:')
      console.debug(error);
      if (error.response?.status === 404) {
        enqueueSnackbar('Format not found', { variant: 'error' });
      } else if (error.response?.status === 403) {
        enqueueSnackbar(t('static_format_delete_error'), { variant: 'error' });
        closeDeleteDialog();
      } else {
        enqueueSnackbar('Error deleting format', { variant: 'error' });
      }
      closeDeleteDialog();
    }
  }, [token, logout, setRefreshSearchables, closeDeleteDialog, fetchFormats,t]);

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('navbar.formats')}
        </Typography>
        {auth && (
          <Button
            sx={{
              backgroundColor: theme.palette.custom.bright,
              borderRadius: 3,
              textTransform: 'none',
            }}
            onClick={openAddDialog}
            aria-label="new-format"
            variant="contained"
            startIcon={<AddIcon />}
          >
            {reverseWords(`${t('common.new')} ${t('common.format')}`)}
          </Button>
        )}
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          handleDeleteRow={openDeleteDialog}
          handleEditRow={openEditDialog}
          handleReportRow={openReportDialog}
          type="format"
        />
        <FormatDialog
          mode={dialogMode}
          open={dialogOpen}
          onClose={closeAddDialog}
          editedFormat={selectedFormat}
        />
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          deletedItem={selectedFormat}
          onDelete={deleteFormat}
          type="format"
        />
        <ReportDialog
          open={reportDialogOpen}
          onClose={closeReportDialog}
          reportedItem={selectedFormat}
        />
      </Box>
    </Box>
  );
};

export default Formats;
