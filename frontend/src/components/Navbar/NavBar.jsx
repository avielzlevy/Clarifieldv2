import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
} from '@mui/material';

import { SpaceDashboardRounded as DashboardIcon } from '@mui/icons-material';

import {
  Boxes,
  Book,
  FileJson,
  Shield,
  Settings as SettingsIcon,
  ChartNoAxesColumn,
  Logs as LogsIcon,
  User as PersonIcon,
  UserCog as EngineerIcon,
  SquareArrowUp,
} from 'lucide-react';
import ThemeButton from './ThemeSwitch';
import LangDropdown from './LangDropdown';
import { usePage } from '../../contexts/PageContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import Entities from '../../pages/Entities';
import Definitions from '../../pages/Definitions';
import Formats from '../../pages/Formats';
import SignIn from '../../pages/SignIn';
import AdminHome from '../../pages/AdminHome';
import ViewerHome from '../../pages/ViewerHome';
import Validation from '../../pages/Validation';
import Settings from '../../pages/Settings';
import Analytics from '../../pages/Analytics';
import Logs from '../../pages/Logs';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../../contexts/RtlContext';
import SearchAll from './SearchAll';
import Problems from '../Homepage/Admin/Problems';
import Loading from '../Loading';
import { t } from 'i18next';
import ImportDialog from './ImportDialog';




//
// PageContent Component
//
const PageContent = () => {
  const { page } = usePage();
  const { logout, login, auth } = useAuth();
  const token = localStorage.getItem('token');

  // Verify token on mount or when token changes.
  useEffect(() => {
    if (token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          login(token);
        })
        .catch(() => {
          logout({ mode: 'bad_token' });
        });
    }
  }, [token, login, logout]);

  // Determine which component to render based on the page.
  const ComponentToRender = useMemo(() => {
    switch (page) {
      case 'home':
        return auth ? <AdminHome /> : <ViewerHome />;
      case 'entities':
        return <Entities />;
      case 'definitions':
        return <Definitions />;
      case 'validation':
        return <Validation />;
      case 'formats':
        return <Formats />;
      case 'signin':
        return <SignIn />;
      case 'settings':
        return <Settings />;
      case 'analytics':
        return <Analytics />;
      case 'logs':
        return <Logs />;
      default:
        return <div>{t('page_not_found')}</div>;
    }
  }, [page, auth]);
  return <React.Suspense fallback={<Loading />}>
    {ComponentToRender}
  </React.Suspense>
};

//
// NavBar Component
//
const drawerWidth = 240;

function NavBar({ theme, setTheme }) {
  const { page, setPage } = usePage();
  const { auth, logout } = useAuth();
  const token = localStorage.getItem('token');
  const [username] = useState(() => localStorage.getItem('username') || 'Viewer');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { rtl } = useRtl();
  // Handle switching user or logging out.
  const handleChangeUser = useCallback(() => {
    if (token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => logout({ mode: 'logout' }))
        .catch(() => {
          localStorage.setItem('previousPage', page);
          setPage('signin');
          logout({ mode: 'bad_token' });
        });
    } else {
      localStorage.setItem('previousPage', page);
      setPage('signin');
    }
  }, [token, page, setPage, logout]);

  // Memoize the drawer items so they don't get re-created on every render.
  const drawerItems = useMemo(() => {
    const items = [
      { text: 'home', icon: <DashboardIcon />, route: 'home' },
      { text: 'entities', icon: <Boxes />, route: 'entities' },
      { text: 'definitions', icon: <Book />, route: 'definitions' },
      { text: 'formats', icon: <FileJson />, route: 'formats' },
      { text: 'validation', icon: <Shield />, route: 'validation' },
    ];
    if (auth) {
      items.push({ text: 'settings', icon: <SettingsIcon />, route: 'settings' });
      items.push({ text: 'analytics', icon: <ChartNoAxesColumn />, route: 'analytics' });
      items.push({ text: 'logs', icon: <LogsIcon />, route: 'logs' });
    }
    return items;
  }, [auth]);

  return (
    <Box dir={rtl ? 'rtl' : 'ltr'} sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', ml: 10 }}>
            <DashboardIcon sx={{ color: theme.palette.custom.bright }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                '&:hover': { cursor: 'pointer' },
                fontWeight: 'bold',
              }}
              onClick={() => setPage('home')}
            >
              {t('navbar.app_name')}
            </Typography>
          </Box>
          <SearchAll setPage={setPage} />

          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {auth &&
              <IconButton onClick={() => setImportDialogOpen(true)}>
                <SquareArrowUp />
              </IconButton>
            }
            <Problems />
            <Tooltip title={username === 'Viewer' || username === '' ? t('navbar.viewer') : t('navbar.admin')}>
              <IconButton color="inherit" onClick={handleChangeUser}>
                {auth ? <EngineerIcon /> : <PersonIcon />}
              </IconButton>
            </Tooltip>
            <LangDropdown />
            <ThemeButton theme={theme} setTheme={setTheme} />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 64 }} />
        <Divider />
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.2,
          }}
        >
          {drawerItems.map((item) => (
            <ListItemButton
              key={item.route}
              disableRipple
              onClick={() => setPage(item.route)}
              sx={{
                '&:hover': { bgcolor: theme.palette.custom.light, cursor: 'pointer' },
                color:
                  theme.palette.mode === 'light'
                    ? page === item.route
                      ? theme.palette.custom.bright
                      : undefined
                    : page === item.route
                      ? theme.palette.custom.dark
                      : undefined,
                bgcolor:
                  theme.palette.mode === 'light'
                    ? page === item.route
                      ? theme.palette.custom.light
                      : undefined
                    : page === item.route
                      ? theme.palette.custom.bright
                      : undefined,
                borderRadius: '20px',
                width: '90%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    theme.palette.mode === 'light'
                      ? page === item.route
                        ? theme.palette.custom.bright
                        : undefined
                      : page === item.route
                        ? theme.palette.custom.db
                        : undefined,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={t(`navbar.${item.text}`)} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 1 }}>
        <Toolbar />
        <PageContent />
        <ImportDialog open={importDialogOpen} setOpen={setImportDialogOpen} />
      </Box>
    </Box>
  );
}

export default NavBar;
