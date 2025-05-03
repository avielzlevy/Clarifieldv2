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

  // Validate schema changes on every editor change
  const handleSchemaValidation = useCallback(async (value) => {
    setSchema(value);
    if (isValidJSON(value)) {
      setIsValidating(true);
      const response = await validateJSON(value);
      if (response && response.data) {
        // Assume response.data is an array of violations when invalid
        setValidationResult({ isValid: false, violations: response.data });
      } else {
        setValidationResult({ isValid: true });
      }
      setIsValidating(false);
    } else {
      setValidationResult(null);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        height: '87.5vh',
        m: 1,
      }}
    >
      {/* Editor Section */}
      <Box sx={{ flexGrow: 1 }} dir="ltr">
        <Editor
          loading={<Loading />}
          width="100%"
          defaultLanguage="json"
          defaultValue=""
          value={schema}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          options={{ minimap: { enabled: false } }}
          onChange={(value) => handleSchemaValidation(value)}
        />
      </Box>

      {/* New Validation Results Section */}
      <Box
        sx={{
          width: '50%',
          p: 2,
          overflow: 'auto',
          backgroundColor: theme.palette.custom.editor,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
            >
              <Shield
                style={{
                  marginRight: 8,
                  height: 20,
                  width: 20,
                  color: '#6366F1',
                }}
              />
              {t('validation.results')}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, overflow: 'auto' }}>
            {isValidating ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 160,
                }}
              >
                <RefreshCw
                  style={{
                    height: 32,
                    width: 32,
                    color: '#6366F1',
                    marginBottom: 16,
                    animation: `${spinAnimation} 1s linear infinite`,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t('validation.validating_json')}
                </Typography>
              </Box>
            ) : validationResult ? (
              <Stack spacing={3}>
                {/* Validation Result */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: validationResult.isValid
                      ? '#f0fdf4'
                      : '#fef2f2',
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
                          color: '#10B981',
                          marginRight: 12,
                        }}
                      />
                    ) : (
                      <AlertTriangle
                        style={{
                          height: 24,
                          width: 24,
                          color: '#EF4444',
                          marginRight: 12,
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
                              p: 1,
                              backgroundColor: 'grey.100',
                              borderRadius: 1,
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <AlertTriangle
                              style={{
                                height: 20,
                                width: 20,
                                minWidth:20,
                                minHeight:20,
                                color: '#EF4444',
                                marginRight: 8,
                                marginTop: 0,
                              }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontFamily: 'monospace',
                                  color: '#DC2626',
                                }}
                              >
                                {violation}
                              </Typography>

                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                {/* Schema Validation Message */}
                {validationResult.isValid && (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'grey.100',
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
              null
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Validation;
