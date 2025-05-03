import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { PageProvider } from './contexts/PageContext';
import { AuthProvider } from './contexts/AuthContext';
import { RtlProvider, useRtl } from './contexts/RtlContext';
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';
import NavBar from './components/NavBar';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { SearchProvider } from './contexts/SearchContext';
import { FormatsProvider } from './contexts/useFormats';
import { DefinitionsProvider } from './contexts/useDefinitions';
import { EntitiesProvider } from './contexts/useEntities';
import { AffectedItemsProvider } from './contexts/useAffectedItems';
import Loading from './components/Loading';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'mui',
});

const globalScrollbarStyles = (
  <GlobalStyles
    styles={{
      "::-webkit-scrollbar": {
        width: "3px",
        backgroundColor: "transparent",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
      },
      "::-webkit-scrollbar-thumb": {
        borderRadius: "40px",
        backgroundColor: "#848484cd",
      },
    }}
  />
);

const Providers = ({ children }) => (
  <PageProvider>
    <AuthProvider>
      <RtlProvider>
        <SearchProvider>
          <FormatsProvider>
            <DefinitionsProvider>
              <EntitiesProvider>
                <AffectedItemsProvider>
                  {children}
                </AffectedItemsProvider>
              </EntitiesProvider>
            </DefinitionsProvider>
          </FormatsProvider>
        </SearchProvider>
      </RtlProvider>
    </AuthProvider>
  </PageProvider>
);

function AppContent({ theme, setTheme }) {
  const { rtl,rtlLoading } = useRtl();
  const cache = rtl ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          {globalScrollbarStyles}
          {rtlLoading && <Loading mode="full" />}
          <NavBar theme={theme} setTheme={setTheme} language />
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    const darkMode = localStorage.getItem('darkMode');
    return darkMode === 'true' ? darkTheme : lightTheme;
  });

  return (
    <Providers>
      <AppContent theme={theme} setTheme={setTheme} />
    </Providers>
  );
}

export default App;
