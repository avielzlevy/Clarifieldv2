import React, { useState, useCallback } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import { usePage } from '../contexts/PageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

function SignIn() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { setPage } = usePage();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  // Single handler for input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Sign-in handler with API call and navigation logic
  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/signin`,
          credentials
        );
        localStorage.setItem('username', data.username);
        login(data.token);
        enqueueSnackbar(t('login.signed_in'), { variant: 'success' });

        const previousPage = localStorage.getItem('previousPage');
        setPage(previousPage || 'home');
        if (previousPage) {
          localStorage.removeItem('previousPage');
        }
      } catch (error) {
        console.error('Authentication failed', error);
        const message = error.response?.data?.message || 'Authentication failed';
        enqueueSnackbar(t('login.sign_in_failed', { message }), { variant: 'error' });
      }
    },
    [credentials, login, enqueueSnackbar, t, setPage]
  );

  return (
    <Container sx={{ mt: 8 }}>
      <Box
        component="form"
        onSubmit={handleSignIn}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('login.sign_in')}
        </Typography>
        <TextField
          name="username"
          label={t('login.username')}
          fullWidth
          required
          value={credentials.username}
          onChange={handleChange}
        />
        <TextField
          name="password"
          label={t('login.password')}
          type="password"
          fullWidth
          required
          value={credentials.password}
          onChange={handleChange}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          {t('login.sign_in')}
        </Button>
      </Box>
    </Container>
  );
}

export default SignIn;
