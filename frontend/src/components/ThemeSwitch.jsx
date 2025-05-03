import React, { useState, useCallback } from 'react';
import { IconButton } from '@mui/material';
import {
  Sun,
  Moon,
} from 'lucide-react';
import darkTheme from '../themes/darkTheme';
import lightTheme from '../themes/lightTheme';

const FADE_DURATION = 1000; // Duration for fade out/in transitions in ms
const FADE_DELAY = 200; // Delay before applying the theme change in ms

function ThemeButton({ theme, setTheme }) {
  const [fade, setFade] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState({});
  // Helper to update the theme and persist preference to localStorage.
  const applyThemeChange = useCallback(
    (newTheme) => {
      const newThemeObject = newTheme === 'dark' ? darkTheme : lightTheme;
      setTheme(newThemeObject);
      localStorage.setItem('darkMode', newTheme === 'dark' ? 'true' : 'false');
    },
    [setTheme]
  );

  // Handles theme change with a fade effect when transitioning from dark to light.
  const changeTheme = useCallback(
    (newTheme) => {
        // Set up the overlay with initial styles.
        setOverlayStyle({
          backgroundColor: theme.palette.background.default,
          opacity: 1,
          transition: `opacity ${FADE_DURATION}ms ease-in`,
        });
        setFade(true);

        // Delay updating the theme to show the overlay.
        setTimeout(() => {
          applyThemeChange(newTheme);
          // Fade out the overlay.
          setOverlayStyle((prev) => ({ ...prev, opacity: 0 }));
          // Remove the overlay after the fade-out completes.
          setTimeout(() => {
            setFade(false);
          }, FADE_DURATION);
        }, FADE_DELAY);
    },
    [theme.palette.background.default, applyThemeChange]
  );

  const handleClick = useCallback(() => {
    const nextTheme = theme.palette.mode === 'dark' ? 'light' : 'dark';
    changeTheme(nextTheme);
  }, [theme.palette.mode, changeTheme]);

  return (
    <div style={{ position: 'relative' }}>
      <IconButton disableRipple onClick={handleClick}>
        {theme.palette.mode === 'dark' ? (
          <Sun style={{ color: '#FFD242' }} />
        ) : (
          <Moon style={{ color: 'black' }} />
        )}
      </IconButton>
      {fade && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1300,
            ...overlayStyle,
          }}
        />
      )}
    </div>
  );
}

export default ThemeButton;