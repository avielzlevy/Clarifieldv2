import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
// Adjust these imports to match your icon library
import { Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import Loading from '../components/Loading';

// Define a simple keyframes animation for the loading spinner
const spinAnimation = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';

// Helper to check valid JSON
const isValidJSON = (jsonString) => {
  if (!jsonString) return false;
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

// Validate JSON via API call
const validateJSON = async (jsonString) => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/validate`, jsonString, {
      headers: { 'Content-Type': 'application/json' },
    });
    return null;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return error.response;
    }
    console.error('Validation error:', error);
    return { data: [{ path: '', message: 'Unexpected error during validation.' }] };
  }
};

function Validation() {
  const [schema, setSchema] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleSchemaValidation = useCallback(async (value) => {
    setSchema(value);
    if (isValidJSON(value)) {
      setIsValidating(true);
      const response = await validateJSON(value);
      if (response && response.data) { // If error.response was returned, response.data is the JSON body
        setValidationResult({ isValid: false, violations: response.data.errors || [] });
      } else if (response === null) { // Explicitly check for successful validation (returned null)
        setValidationResult({ isValid: true, violations: [] }); // Ensure violations is an empty array for valid state
      } else { // Handle unexpected response structure from validateJSON (e.g., the custom error object)
        setValidationResult({ isValid: false, violations: response.data || [] }); // Assuming response.data might be an array of simple errors in this case
      }
      setIsValidating(false);
    } else {
      setValidationResult(null); // Clear results if JSON is not even structurally valid
    }
  }, []); // Dependencies: t, theme (if used inside, but they are stable from hooks)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2, // This will be theme.spacing(2)
        height: '87.5vh',
        m: 1,
      }}
    >
      {/* Editor Section */}
      <Box sx={{ flex: '1 1 0%', minWidth: 0 /* Allow editor to shrink and grow */ }} dir="ltr">
        <Editor
          loading={<Loading />}
          width="100%"
          height="100%" // Ensure editor tries to fill this container
          defaultLanguage="json"
          defaultValue=""
          value={schema}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          options={{ minimap: { enabled: false }, automaticLayout: true /* Recommended for responsive containers */ }}
          onChange={(value) => handleSchemaValidation(value || '')} // Pass empty string if value is undefined
        />
      </Box>

      {/* New Validation Results Section - Revised Structure */}
      <Box
        sx={{
          width: '45%', // Or '50%' if preferred, adjust as needed
          flexShrink: 0, // Prevent this panel from shrinking
          p: 2,
          backgroundColor: theme.palette.custom?.editor || 'background.paper', // Added fallback for custom.editor
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Parent handles structure, children handle scrolling
        }}
      >
        {/* Header */}
        <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
          >
            <Shield
              style={{
                marginRight: theme.spacing(1), // Use theme spacing
                height: 20,
                width: 20,
                color: '#6366F1',
              }}
            />
            {t('validation.results')}
          </Typography>
        </Box>

        {/* Content - This part will scroll */}
        <Box sx={{ p: 3, overflow: 'auto', flexGrow: 1 }}>
          {isValidating ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%', // Fill available space for centering
                minHeight: 160, // Ensure some minimum height
              }}
            >
              <RefreshCw
                style={{ // Basic styles
                  height: 32,
                  width: 32,
                  color: '#6366F1',
                  marginBottom: theme.spacing(2),
                }}
                sx={{ // Animation via sx (ensure @keyframes spin is globally defined)
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t('validation.validating_json')}
              </Typography>
            </Box>
          ) : validationResult ? (
            <Stack spacing={3}>
              {/* Validation Result Box */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2, // Or theme.shape.borderRadius
                  backgroundColor: validationResult.isValid
                    ? theme.palette.success.lighter || '#f0fdf4' // Use theme colors with fallbacks
                    : theme.palette.error.lighter || '#fef2f2',
                  border: 1,
                  borderColor: validationResult.isValid ? 'success.main' : 'error.main',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {validationResult.isValid ? (
                    <CheckCircle
                      style={{
                        height: 24,
                        width: 24,
                        color: theme.palette.success.main || '#10B981',
                        marginRight: theme.spacing(1.5),
                      }}
                    />
                  ) : (
                    <AlertTriangle
                      style={{
                        height: 24,
                        width: 24,
                        color: theme.palette.error.main || '#EF4444',
                        marginRight: theme.spacing(1.5),
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {validationResult.isValid ? t('validation.valid') : t('validation.invalid')} JSON
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: validationResult.isValid ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {validationResult.isValid
                        ? t('validation.meet_requirements')
                        : t('validation.does_not_meet')
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Validation Issues */}
              {!validationResult.isValid &&
                validationResult.violations &&
                validationResult.violations.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}
                    >
                      {t('validation.validations_issues')}
                    </Typography>
                    <Stack spacing={2} dir="ltr">
                      {validationResult.violations.map((violation, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1.5, // Increased padding slightly
                            backgroundColor: theme.palette.grey[100],
                            borderRadius: 1, // Or theme.shape.borderRadius / 2
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start', // Align items to start for multi-line messages
                          }}
                        >
                          <AlertTriangle
                            style={{
                              height: 20,
                              width: 20,
                              minWidth: 20, // Ensure icon doesn't shrink
                              color: theme.palette.error.main || '#EF4444',
                              marginRight: theme.spacing(1),
                              marginTop: theme.spacing(0.25), // Slight top margin for alignment with text
                            }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontFamily: 'monospace',
                                color: theme.palette.error.dark || '#DC2626',
                                whiteSpace: 'pre-wrap', // Allow wrapping of long messages
                                wordBreak: 'break-all', // Break long words/paths
                              }}
                            >
                              {typeof violation === 'string' ? violation : JSON.stringify(violation)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

              {/* Schema Validation Message (Only if JSON is valid AND no specific violations listed) */}
              {validationResult.isValid && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.grey[100],
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}
                  >
                    {t('validation.schema_validation')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('validation.schema_valid')}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : (
            // Initial state or invalid JSON (not yet validated via API)
            // You can put a placeholder here if desired, e.g., "Enter JSON to validate"
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              {t('validation.enter_json_prompt')}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Validation;