import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import DeleteDialog from '../components/DeleteDialog';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import DefinitionDialog from '../components/DefinitionDialog';
import { useAuth } from '../contexts/AuthContext';
import CustomDataGrid from '../components/CustomDataGrid';
import { enqueueSnackbar } from 'notistack';
import ReportDialog from '../components/ReportDialog';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useRtl } from '../contexts/RtlContext';
import { useSearch } from '../contexts/SearchContext';
import { useDefinitions } from '../contexts/useDefinitions';
function Definitions() {
  const { definitions, fetchDefinitions } = useDefinitions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [actionedDefinition, setActionedDefinition] = useState(null);
  const { auth } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const { t } = useTranslation();
  const theme = useTheme();
  const { reverseWords } = useRtl();
  const token = localStorage.getItem('token');

  const rows = useMemo(() =>
    Object.entries(definitions).map(([name, defData]) => ({
      id: name,
      name,
      format: defData.format,
      description: defData.description,
    })),
    [definitions]
  );

  const handleAddDialogClick = useCallback(() => {
    setDialogMode('add');
    setActionedDefinition(null);
    setDialogOpen(true);
  }, []);

  const handleEditDialogClick = useCallback(async (definition) => {
    setDialogMode('edit');
    setActionedDefinition(definition);
    setDialogOpen(true);
  }, []);

  const handleDeleteDialogClick = useCallback((definition) => {
    setActionedDefinition(definition);
    setDeleteDialogOpen(true);
  }, []);



  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleReportDialogClick = useCallback((definition) => {
    setActionedDefinition(definition);
    setReportDialogOpen(true);
  }, []);

  const closeReportDialog = useCallback(() => {
    setActionedDefinition(null);
    setReportDialogOpen(false);
  }, []);

  const deleteDefinition = useCallback(async () => {
    if (!actionedDefinition) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/definitions/${actionedDefinition.name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDefinitions();
      enqueueSnackbar(t('definitions.deleted_definition'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setActionedDefinition(null);
      setRefreshSearchables((prev) => prev + 1);
    } catch (error) {
      enqueueSnackbar(t('error_deleting_definition'), { variant: 'error' });
    }
  }, [actionedDefinition, fetchDefinitions, setRefreshSearchables, token,t]);

  const columns = useMemo(()=>[
    { field: 'name', headerName: t('common.name'), flex: 1 },
    {
      field: 'format',
      headerName: t('common.format'),
      flex: 1,
    },
    { field: 'description', headerName: t('common.description'), flex: 2 },
  ],[t]);

  return (
    <Box sx={{ padding: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('navbar.definitions')}
        </Typography>
        {auth && (
          <Button
            sx={{ backgroundColor: theme.palette.custom.bright, borderRadius: 3, textTransform: 'none' }}
            onClick={handleAddDialogClick}
            aria-label="new-definition"
            variant="contained"
            startIcon={<AddIcon />}
          >
            {reverseWords(`${t('common.new')} ${t('common.definition')}`)}
          </Button>
        )}
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          handleDeleteRow={handleDeleteDialogClick}
          handleEditRow={handleEditDialogClick}
          handleReportRow={handleReportDialogClick}
          type="definition"
        />
        <DefinitionDialog
          mode={dialogMode}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          editedDefinition={actionedDefinition}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          deletedItem={actionedDefinition}
          onDelete={deleteDefinition}
          type="definition"
        />

        <ReportDialog open={reportDialogOpen} onClose={closeReportDialog} reportedItem={actionedDefinition} />
      </Box>
    </Box>
  );
}

export default Definitions;
