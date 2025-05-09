import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DataGrid } from '@mui/x-data-grid';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    (async () => {
      setLoading(true);
      try {
        const { status, data, statusText } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/logs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (status !== 200) {
          throw new Error(`Error ${status}: ${statusText}`);
        }
        // const parsedLogs = parseLogs(data);
        setLogs(data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          logout({ mode: 'bad_token' });
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [logout]);

  // Define columns for the DataGrid
  const columns = useMemo(() => [
    { field: 'timestamp', headerName: t('common.timestamp'), width: 210, headerAlign: 'center', align: 'center' },
    { field: 'ip', headerName: t('logs.ip_address'), width: 120, headerAlign: 'center', align: 'center' },
    { field: 'method', headerName: t('logs.method'), width: 100, headerAlign: 'center', align: 'center' },
    {
      field: 'path', headerName: t('logs.url'),
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        <Box dir="ltr" sx={{ width: '100%', textAlign: 'center' }}>
          {params.value}
        </Box>
      ),
    },
    { field: 'status', headerName: t('logs.status'), width: 70, headerAlign: 'center', align: 'center' },
    { field: 'duration', headerName: t('logs.response_time'), width: 100, headerAlign: 'center', align: 'center' },
  ], [t]);


  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error">
          {t('logs.error_fetching_logs')}: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '90vh', width: '100%' }}>
      <DataGrid
        rows={logs}
        columns={columns}
        loading={loading}
        pagination
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
      />
    </Paper>
  );
};

export default LogsPage;
