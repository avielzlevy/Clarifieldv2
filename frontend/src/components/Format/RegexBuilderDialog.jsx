"use client"
import React, { useState, useEffect, useCallback, useReducer } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import RandExp from 'randexp'
import { RefreshCcw, CircleCheck, CircleX, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const HEBREW_CHARS = "אבגדהוזחטיכלמנסעפצקרשתךםןףץ";
const DEFAULT_MIN_MAX = { min: "", max: "" };

const initialPresets = {
  digits: false,
  uppercase: false,
  lowercase: false,
  whitespace: false,
  specialChars: false,
  hebrewLetters: false,
};

const presetReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, [action.payload]: !state[action.payload] };
    case "RESET":
      return initialPresets;
    case "SET":
      return { ...action.payload };
    default:
      return state;
  }
};

// Generates a regex string from the presets and length values.
const constructPatternFromPresets = (presets, min, max) => {
  const charClasses = [];
  if (presets.digits) charClasses.push("0-9");
  if (presets.hebrewLetters) charClasses.push("א-תךםןףץ");
  if (presets.lowercase) charClasses.push("a-z");
  if (presets.uppercase) charClasses.push("A-Z");
  if (presets.whitespace) charClasses.push("\\s");
  if (presets.specialChars)
    charClasses.push("!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?\\\\");
  const basePattern = charClasses.length ? `[${charClasses.join("")}]` : "";
  return `^${basePattern}${min ? `{${min},${max}}` : ""}$`;
};

export default function RegexBuilderDialog(props) {
  const { open, setOpen, setFormat, defaultPattern = "" } = props;
  // The regex pattern is now the source of truth and always editable.
  const [pattern, setPattern] = useState(defaultPattern || "");
  const [testString, setTestString] = useState("Test your regex here");
  const [matches, setMatches] = useState(false);
  const [examples, setExamples] = useState([]);
  const { t } = useTranslation();

  // Presets now merely reflect what's in the regex.
  const [presets, dispatch] = useReducer(presetReducer, initialPresets);
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");

  // Extracts min and max from a regex quantifier in the pattern.
  const extractMinMaxFromPattern = useCallback((patternStr) => {
    const match = patternStr.match(/\{(\d+),?(\d+)?\}/);
    return match
      ? { min: parseInt(match[1], 10), max: match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10) }
      : DEFAULT_MIN_MAX;
  }, []);

  // Auto-detect presets from the regex string.
  const determinePresets = useCallback((patternStr) => {
    const toggledPresets = { ...initialPresets };
    if (patternStr.includes("0-9")) toggledPresets.digits = true;
    if (patternStr.includes("a-z")) toggledPresets.lowercase = true;
    if (patternStr.includes("A-Z")) toggledPresets.uppercase = true;
    if (patternStr.includes("\\s")) toggledPresets.whitespace = true;
    if (patternStr.includes("!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?\\\\")) toggledPresets.specialChars = true;
    if (patternStr.includes("א-תךםןףץ")) toggledPresets.hebrewLetters = true;
    dispatch({ type: "SET", payload: toggledPresets });
  }, []);

  // On initial load: if a defaultPattern exists, set it and extract length settings.
  useEffect(() => {
    if (defaultPattern) {
      setPattern(defaultPattern);
      determinePresets(defaultPattern);
      const { min, max } = extractMinMaxFromPattern(defaultPattern);
      setMinLength(min.toString());
      setMaxLength(max.toString());
    }
  }, [defaultPattern, determinePresets, extractMinMaxFromPattern]);

  // When the user manually edits the regex field, update the presets accordingly.
  const handlePatternChange = (e) => {
    const newPattern = e.target.value;
    setPattern(newPattern);
    determinePresets(newPattern);
  };

  // When a preset button is toggled, update the presets and regenerate the regex.
  const handlePresetToggle = (key) => {
    // Toggle the preset.
    dispatch({ type: "TOGGLE", payload: key });
    // Create a new regex from the updated presets and current length.
    const newPattern = constructPatternFromPresets({ ...presets, [key]: !presets[key] }, minLength, maxLength);
    setPattern(newPattern);
    // Re-run auto-detection to sync up presets with the generated regex.
    determinePresets(newPattern);
  };

  // If length changes and the current regex was auto‑generated, update it.
  const handleMinChange = (e) => {
    const newMin = e.target.value;
    setMinLength(newMin);
    const generated = constructPatternFromPresets(presets, newMin, maxLength);
    // Update regex only if it currently matches what would be generated.
    if (pattern === constructPatternFromPresets(presets, minLength, maxLength)) {
      setPattern(generated);
    }
  };

  const handleMaxChange = (e) => {
    const newMax = e.target.value;
    setMaxLength(newMax);
    const generated = constructPatternFromPresets(presets, minLength, newMax);
    if (pattern === constructPatternFromPresets(presets, minLength, maxLength)) {
      setPattern(generated);
    }
  };

  useEffect(() => {
    if (!pattern) {
      setMatches(false);
      return;
    }
    try {
      const regex = new RegExp(pattern, "g");
      setMatches(regex.test(testString));
    } catch (error) {
      setMatches(false);
    }
  }, [pattern, testString]);

  const generateHebrewExample = useCallback(({ min, max, numbers = false }) => {
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    let charSet = HEBREW_CHARS + (numbers ? "0123456789" : "");
    return Array.from({ length }, () =>
      charSet.charAt(Math.floor(Math.random() * charSet.length))
    ).join("");
  }, []);

  const mixHebrewIntoExample = useCallback((baseExample) => {
    return baseExample
      .split("")
      .map((char) =>
        Math.random() < 0.5
          ? HEBREW_CHARS.charAt(Math.floor(Math.random() * HEBREW_CHARS.length))
          : char
      )
      .join("");
  }, []);

  const generateAllowed = useCallback(() => {
    try {
      const { min, max } = extractMinMaxFromPattern(pattern);
      const validExamples = [];
      for (let i = 0; i < 5; i++) {
        let example;
        if (pattern.includes("א-תךםןףץ") && !pattern.match(/[a-zA-Z0-9]/)) {
          example = generateHebrewExample({ min, max });
        } else {
          example = new RandExp(pattern).gen();
          if (pattern.includes("א-ת") || pattern.includes("ךםןףץ")) {
            example = mixHebrewIntoExample(example);
          }
        }
        validExamples.push(example);
      }
      setExamples(validExamples);
    } catch {
      setExamples([]);
    }
  }, [pattern, extractMinMaxFromPattern, generateHebrewExample, mixHebrewIntoExample]);

  useEffect(() => {
    if (!pattern || (minLength !== "" && maxLength !== "" && (!pattern.includes("[") || !pattern.includes("]")))) {
      setExamples([]);
      return;
    }
    try {
      generateAllowed();
    } catch (error) {
      setExamples([]);
    }
  }, [pattern, generateAllowed, minLength, maxLength]);

  const copyRegex = () => navigator.clipboard.writeText(`/${pattern}/`);
  const generateRandomTestString = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*() ";
    setTestString(
      Array.from({ length: 20 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("")
    );
  };

  const useFormat = () => {
    setFormat((prev) => ({ ...prev, pattern }));
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {t('formats.open_regex_builder')}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl">
        <DialogTitle>
          {t('formats.regex_builder')}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '20vw',
                gap: 2,
              }}
            >
              <Typography variant="h7" gutterBottom>
                {t('formats.presets')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.keys(initialPresets).map((key) => (
                  <Button
                    key={key}
                    sx={{ textTransform: 'none' }}
                    variant={presets[key] ? "contained" : "outlined"}
                    onClick={() => handlePresetToggle(key)}
                  >
                    {t(`formats.${key}`)}
                  </Button>
                ))}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    label={t('formats.min')}
                    variant="outlined"
                    size="small"
                    type="number"
                    value={minLength}
                    onChange={handleMinChange}
                  />
                  <TextField
                    label={t('formats.max')}
                    variant="outlined"
                    size="small"
                    type="number"
                    value={maxLength}
                    onChange={handleMaxChange}
                  />
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '50vw',
                width: '50vw',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1">{t('formats.currentRegex')}</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    padding: 1,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={pattern}
                    onChange={handlePatternChange}
                    InputProps={{
                      style: { fontFamily: 'monospace' },
                      endAdornment: (
                        <IconButton onClick={copyRegex} size="small">
                          <Copy fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Test String</Typography>
                  <Button onClick={generateRandomTestString} startIcon={<RefreshCcw fontSize="small" />}>
                    {t('formats.random')}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  sx={{
                    "& fieldset": { border: 'none' },
                    border: matches ? '1px solid green' : '1px solid red',
                    borderRadius: 2,
                  }}
                  InputProps={{
                    endAdornment: matches ? <CircleCheck color="green" /> : <CircleX color="red" />,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxWidth: '50vw',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">Reference Window</Typography>
                  <RefreshCcw onClick={generateAllowed} style={{ cursor: 'pointer' }} />
                </Box>
                {examples.length ? (
                  examples.map((ex, i) => (
                    <Chip key={i} label={ex} variant="outlined" color="success" onClick={() => setTestString(ex)} />
                  ))
                ) : (
                  <Typography>{t('formats.no_examples')}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.close')}</Button>
          <Button onClick={useFormat} variant="contained" color="primary">
            {t('formats.use_regex')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
