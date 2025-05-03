import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  TextField,
  Chip
} from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { logout } = useAuth();
  const token = localStorage.getItem('token');
  const { t } = useTranslation();

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const [settings, setSettings] = useState({
    namingConvention: '',
  });

  // ------------------------------------------------------------
  // FETCH on MOUNT
  // ------------------------------------------------------------
  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings({
        namingConvention: data.namingConvention || '',
      });
    } catch (err) {
      if (err.response?.status === 401) {
        logout({ mode: 'bad_token' });
      } else {
        console.error('Error fetching settings:', err);
        enqueueSnackbar(t('settings.fetch_failed'), { variant: 'error' });
      }
    }
  }, [logout, token, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ------------------------------------------------------------
  // NAMING CONVENTION HANDLERS (unchanged)
  // ------------------------------------------------------------
  const handleNamingConventionChange = useCallback((e) => {
    setSettings(prev => ({ ...prev, namingConvention: e.target.value }));
  }, []);

  const handleApplyClick = useCallback(async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        { namingConvention: settings.namingConvention },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      enqueueSnackbar(t('settings.updated'), { variant: 'success' });
    } catch (err) {
      if (err.response?.status === 401) {
        logout({ mode: 'bad_token' });
      } else {
        console.error('Error applying settings:', err);
        enqueueSnackbar(t('settings.update_failed'), { variant: 'error' });
      }
    }
  }, [logout, settings.namingConvention, token, t]);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 2,
        flexGrow: 1
      }}
    >
      <Typography variant="h6">{t('settings.settings')}</Typography>

      {/* Naming Convention */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 400 }}>
        <FormControl fullWidth>
          <InputLabel id="naming-convention-label">
            {t('settings.naming_conventions')}
          </InputLabel>
          <Select
            labelId="naming-convention-label"
            id="naming-convention"
            value={settings.namingConvention}
            onChange={handleNamingConventionChange}
            dir="ltr"
            sx={{ mt: 1.3, ml: 1.5 }}
          >
            <MenuItem value="snake_case">{t('common.snake_case')}</MenuItem>
            <MenuItem value="camelCase">{t('common.camel_case')}</MenuItem>
            <MenuItem value="PascalCase">{t('common.pascal_case')}</MenuItem>
            <MenuItem value="kebab-case">{t('common.kebab_case')}</MenuItem>
          </Select>
        </FormControl>
        <Button
          sx={{ mt: 1.3 }}
          variant="contained"
          color="primary"
          onClick={handleApplyClick}
        >
          {t('common.apply')}
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
