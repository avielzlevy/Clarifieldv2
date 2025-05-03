import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Tooltip, Box } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import i18next from 'i18next';
import { useRtl } from '../contexts/RtlContext';

const languages = [
  { code: 'en'},
  { code: 'he'},
  { code: 'ar'},
  { code: 'es'},
  { code: 'fr'},
  { code: 'de'},
];

const rtlLangs = ['he', 'ar'];

const LanguageGrid = React.memo(styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  maxWidth: 135,
  gap: theme.spacing(1),
  padding: theme.spacing(1),
})));

const LanguageItem = styled(Box)(({ theme, selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 29,
  height: 24,
  margin: 2,
  borderRadius: '20%',
  fontSize: '1.5rem',
  cursor: 'pointer',
  fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
  transition: 'border-color 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.light,
  },
}));

function LangDropdown() {
  const [open, setOpen] = useState(false);
  // Extract the dynamic 'rtl' state from context along with setters
  const { rtl, setRtl, setRtlLoading } = useRtl();
  const theme = useTheme();

  // Get initial language code from localStorage
  const initialLangCode = useMemo(() => localStorage.getItem('lang') || 'en', []);
  const [selectedLangCode, setSelectedLangCode] = useState(initialLangCode);

  const handleRtlSlowLoad = useCallback(() => {
    setRtlLoading(true);
    setTimeout(() => {
      setRtlLoading(false);
    }, 500);
  }, [setRtlLoading]);

  useEffect(() => {
    // Update language in i18next and localStorage
    i18next.changeLanguage(selectedLangCode);
    localStorage.setItem('lang', selectedLangCode);

    // Determine the writing direction for the new language
    const newLangIsRtl = rtlLangs.includes(selectedLangCode);

    // Trigger slow loading only if the writing direction is actually changing
    if (newLangIsRtl !== rtl) {
      handleRtlSlowLoad();
    }

    // Update the RTL state accordingly
    setRtl(newLangIsRtl);
  }, [selectedLangCode, rtl, setRtl, handleRtlSlowLoad]);

  const handleTooltipClose = useCallback(() => setOpen(false), []);
  const handleTooltipToggle = useCallback(() => setOpen((prev) => !prev), []);
  const handleLanguageSelect = useCallback((langCode) => {
    setSelectedLangCode(langCode);
    setOpen(false);
  }, []);

  return (
    <Box>
      <Tooltip
        slotProps={{
          tooltip: {
            sx: { bgcolor: theme.palette.custom?.light || theme.palette.background.paper },
          },
          arrow: {
            sx: { color: theme.palette.custom?.light || theme.palette.background.paper },
          },
        }}
        title={
          <LanguageGrid>
            {languages.map(({ code }) => (
              <LanguageItem
                key={code}
                selected={code === selectedLangCode}
                onClick={() => handleLanguageSelect(code)}
              >
                <Box
                  sx={{
                    backgroundImage: `url(/flags/${code}.svg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '6px',
                    width: '1.20em',
                    height: '0.90em',
                    display: 'inline-block'
                  }}
                />
              </LanguageItem>
            ))}
          </LanguageGrid>
        }
        open={open}
        onClose={handleTooltipClose}
        onOpen={handleTooltipToggle}
        arrow
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <Button
          disableRipple
          onClick={handleTooltipToggle}
          sx={{
            textTransform: 'none',
            fontSize: '2rem',
            height: '24px',
            backgroundColor: 'transparent',
            mb: '4px',
          }}
        >
          <Box
            sx={{
              backgroundImage: `url(/flags/${selectedLangCode}.svg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '5px',
              width: '1.20em',
              height: '0.95em',
              display: 'inline-block'
            }}
          />
        </Button>
      </Tooltip>
    </Box>
  );
}

export default LangDropdown;
