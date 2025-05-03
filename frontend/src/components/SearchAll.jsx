import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { ChevronUp, ChevronDown, Boxes, Book, FileJson } from 'lucide-react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useSearch } from '../contexts/SearchContext';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../contexts/RtlContext';

export default function SearchAll({ setPage }) {
  const theme = useTheme();
  const { setSearch, refreshSearchables } = useSearch();
  const { t } = useTranslation();
  const { rtl } = useRtl();
  const [searchables, setSearchables] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);
  const [forceOpen, setForceOpen] = useState(false);

  // Memoized Icon Mapping to prevent unnecessary re-renders
  const groupIconMap = useMemo(
    () => ({
      Entity: <Boxes style={{ fontSize: '1.5rem', ml: 1 }} />,
      Definition: <Book style={{ fontSize: '1.5rem', ml: 1 }} />,
      Format: <FileJson style={{ fontSize: '1.5rem', ml: 1 }} />,
    }),
    []
  );

  // Fetch searchables
  useEffect(() => {
    const fetchSearchables = async () => {
      try {
        const [entitiesRes, definitionsRes, formatsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/entities`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/formats`),
        ]);

        setSearchables(() => [
          ...Object.values(entitiesRes.data).map((entity) => ({
            type: 'Entity',
            name: entity.label,
          })),
          ...Object.keys(definitionsRes.data).map((def) => ({
            type: 'Definition',
            name: def,
          })),
          ...Object.keys(formatsRes.data).map((format) => ({
            type: 'Format',
            name: format,
          })),
        ]);
      } catch (error) {
        console.error('Error fetching searchables:', error);
      }
    };

    fetchSearchables();
  }, [refreshSearchables]);

  // Handle selection from the autocomplete options.
  const handleSelection = useCallback(
    (event, newOption) => {
      if (!newOption) return;

      setSearch(newOption.name);

      switch (newOption.type) {
        case 'Entity': {
          const index = searchables.findIndex((s) => s.name === newOption.name);
          localStorage.setItem(
            'reactFlowCenter',
            JSON.stringify({ x: index * 150, y: -200, zoom: 2 })
          );
          setPage('entities');
          break;
        }
        case 'Definition':
          setPage('definitions');
          break;
        case 'Format':
          setPage('formats');
          break;
        default:
          break;
      }

      setInputValue('');
      setValue(null);
      setForceOpen(false);
    },
    [searchables, setPage, setSearch]
  );

  return (
    <Autocomplete
      freeSolo
      options={searchables}
      groupBy={(option) => option.type}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name || ''
      }
      sx={{ width: 500 }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      value={value}
      onChange={handleSelection}
      open={forceOpen || Boolean(inputValue)}
      onClose={() => setForceOpen(false)}
      slotProps={{
        listbox: {
          dir: 'ltr'
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t('navbar.search')}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <InputAdornment position="end">
                  <IconButton onClick={() => setForceOpen(!forceOpen)}>
                    {forceOpen ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                </InputAdornment>
              </>
            ),
            type: 'search',
            size: 'small',
            sx: { borderRadius: '20px', marginRight: '10px', height: '40px' },
          }}
        />
      )}
      renderGroup={(params) => (
        <div key={params.key}>
          <Box
            dir={rtl ? 'rtl' : 'ltr'}
            sx={{
              bgcolor: theme.palette.custom?.light || 'inherit',
              display: 'flex',
              padding: 1,
              alignItems: 'center',
            }}
          >
            {groupIconMap[params.group] || null}
            <Typography sx={{ padding: '1px', fontWeight: 'bold', fontSize: '1rem', ml: 1 }}>
              {t(`common.${params.group.toLowerCase()}`)}
            </Typography>
          </Box>
          {params.children}
        </div>
      )}
    />
  );
}
