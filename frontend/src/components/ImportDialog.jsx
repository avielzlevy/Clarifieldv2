import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Boxes } from 'lucide-react';
import Loading from './Loading';

// Adjust these imports to your hook paths
import { useDefinitions } from '../contexts/useDefinitions';
import { useFormats } from '../contexts/useFormats';

const BASE_API_URL = process.env.REACT_APP_API_URL;

export default function ImportDialog({ open, setOpen, onFilesSelected }) {
  // Custom hooks to fetch available definitions and formats
  const { definitions: availableDefinitions } = useDefinitions();
  const { formats: availableFormats } = useFormats();

  const token = localStorage.getItem('token');

  // File related states
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [detectedType, setDetectedType] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Steps: 1 = identification, 2 = processing result, 3 = review & import
  const [step, setStep] = useState(1);

  // Data coming from process API
  const [processedData, setProcessedData] = useState(null);
  // States for table review
  const [selectedEntities, setSelectedEntities] = useState({});
  const [selectedDefinitions, setSelectedDefinitions] = useState({});
  const [definitionOverrides, setDefinitionOverrides] = useState({});
  const [definitionFormatsOverrides, setDefinitionFormatsOverrides] = useState({});
  // entityFieldsOverrides will now store an array of objects { label, type }
  const [entityFieldsOverrides, setEntityFieldsOverrides] = useState({});

  const onClose = useCallback(() => {
    setOpen(false);
    setFiles([]);
    setParsedData(null);
    setDetectedType(null);
    setStep(1);
    setProcessedData(null);
    setSelectedEntities({});
    setSelectedDefinitions({});
    setDefinitionOverrides({});
    setDefinitionFormatsOverrides({});
    setEntityFieldsOverrides({});
  }, [setOpen]);

  // Only allow one file in the dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setFiles([file]);
      if (onFilesSelected) {
        onFilesSelected([file]);
      }
      // Read file immediately to detect file type
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const json = JSON.parse(text);
          const type = detectFileType(json);
          setDetectedType(type);
          setParsedData(json);
        } catch (err) {
          console.error('Error reading file:', err);
          setDetectedType(null);
          setParsedData(null);
        }
      };
      reader.onerror = (err) => {
        console.error('File reading error:', err);
      };
      reader.readAsText(file);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const detectFileType = (jsonData) => {
    if (jsonData?.info?.schema?.includes('https://schema.getpostman.com')) {
      return 'postman';
    } else if (jsonData?.swagger === '2.0') {
      return 'swagger';
    } else if (jsonData?.openapi?.startsWith('3.')) {
      return 'openapi';
    }
    return null;
  };

  const handleProcessFile = () => {
    if (files.length === 0) return;

    setLoading(true);
    setLoadingMessage('Processing file...');
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsedData = JSON.parse(text);

        const fileType = detectFileType(parsedData);
        if (!fileType) {
          throw new Error('Unsupported file type');
        }

        setLoadingMessage(`Processing ${fileType} file...`);

        const processResponse = await fetch(`${BASE_API_URL}/api/process/${fileType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(parsedData),
        });

        if (!processResponse.ok) {
          throw new Error(`Error processing ${fileType} file`);
        }

        const data = await processResponse.json();
        setProcessedData(data);

        // Setup review selections for entities.
        // We store fields as an array of objects. If the field is already an object, keep it;
        // otherwise, convert strings to { label: field, type: 'definition' }
        const entitiesSelection = {};
        const entityFields = {};
        Object.keys(data.entities).forEach((key) => {
          entitiesSelection[key] = true;
          entityFields[key] = (data.entities[key].fields || []).map((field) =>
            typeof field === 'object' && field !== null
              ? field
              : { label: field, type: 'definition' }
          );
        });
        setSelectedEntities(entitiesSelection);
        setEntityFieldsOverrides(entityFields);

        // Setup review selections for definitions
        const definitionsSelection = {};
        const descriptionOverrides = {};
        const formatOverrides = {};
        Object.keys(data.definitions).forEach((key) => {
          definitionsSelection[key] = true;
          descriptionOverrides[key] = data.definitions[key].description || '';
          formatOverrides[key] = data.definitions[key].format || '';
        });
        setSelectedDefinitions(definitionsSelection);
        setDefinitionOverrides(descriptionOverrides);
        setDefinitionFormatsOverrides(formatOverrides);

        // Move to processing result step
        setStep(2);
      } catch (error) {
        console.error('Processing failed:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  // Added loading on transition to review
  const handleContinueToReview = () => {
    setLoading(true);
    setLoadingMessage('Loading review data...');
    setTimeout(() => {
      setStep(3);
      setLoading(false);
    }, 500);
  };

  const handleImport = async () => {
    if (!processedData) return;

    const filteredEntities = {};
    Object.keys(processedData.entities).forEach((key) => {
      if (selectedEntities[key]) {
        filteredEntities[key] = {
          ...processedData.entities[key],
          fields: entityFieldsOverrides[key],
        };
      }
    });

    const filteredDefinitions = {};
    Object.keys(processedData.definitions).forEach((key) => {
      if (selectedDefinitions[key]) {
        filteredDefinitions[key] = {
          ...processedData.definitions[key],
          format: definitionFormatsOverrides[key],
          description: definitionOverrides[key],
        };
      }
    });

    const payload = {
      entities: filteredEntities,
      definitions: filteredDefinitions,
    };

    setLoading(true);
    setLoadingMessage('Importing data...');
    try {
      const importResponse = await fetch(`${BASE_API_URL}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!importResponse.ok) {
        throw new Error('Error importing data');
      }
      const importResult = await importResponse.json();
      console.log('Import successful:', importResult);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper functions for review step selections ---
  const toggleEntitySelection = (entity) => {
    setSelectedEntities((prev) => ({ ...prev, [entity]: !prev[entity] }));
  };

  const toggleDefinitionSelection = (def) => {
    setSelectedDefinitions((prev) => ({ ...prev, [def]: !prev[def] }));
  };

  const selectAllEntities = () => {
    const all = {};
    Object.keys(processedData.entities).forEach((key) => {
      all[key] = true;
    });
    setSelectedEntities(all);
  };

  const deselectAllEntities = () => {
    const all = {};
    Object.keys(processedData.entities).forEach((key) => {
      all[key] = false;
    });
    setSelectedEntities(all);
  };

  const selectAllDefinitions = () => {
    const all = {};
    Object.keys(processedData.definitions).forEach((key) => {
      all[key] = true;
    });
    setSelectedDefinitions(all);
  };

  const deselectAllDefinitions = () => {
    const all = {};
    Object.keys(processedData.definitions).forEach((key) => {
      all[key] = false;
    });
    setSelectedDefinitions(all);
  };

  // --- Render functions for each step ---

  // Step 1: Identification – File selection and type detection
  const renderIdentificationStep = () => {
    if (files.length > 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          {detectedType && (
            <Typography variant="subtitle1" mb={1}>
              Detected file type: {detectedType}
            </Typography>
          )}
          <Typography variant="body1">{files[0].name}</Typography>
        </Box>
      );
    }
    return (
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body1">
          {isDragActive ? 'Drop the file here...' : 'Drag & drop file here or click to select file'}
        </Typography>
      </Box>
    );
  };

  // Step 2: Processing Result – Show summary and “Continue” button
  const renderProcessingStep = () => (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <Typography variant="body1" mb={2}>
        Data processed successfully.
      </Typography>
      {processedData && (
        <Typography variant="body2" mb={2}>
          {`Processed ${Object.keys(processedData.entities).length} entities and ${Object.keys(
            processedData.definitions
          ).length} definitions.`}
        </Typography>
      )}
      <Button variant="contained" onClick={handleContinueToReview}>
        Continue to Review
      </Button>
    </Box>
  );

  // Step 3: Review – Toggle selections for entities and definitions
  const renderReviewTable = () => {
    // Compute combined options for entity fields from availableDefinitions and imported definitions
    const definitionOptions = [
      ...((availableDefinitions && Array.isArray(availableDefinitions))
        ? availableDefinitions.map((d) =>
          typeof d === 'object' ? d : { label: d, type: 'definition' }
        )
        : []),
      ...Object.keys(processedData.definitions || {}).map((key) => ({
        label: key,
        type: 'definition',
      })),
    ];
    // Remove duplicates based on label
    const uniqueDefinitionOptions = Array.from(
      new Set(definitionOptions.map((opt) => opt.label))
    ).map((label) => definitionOptions.find((opt) => opt.label === label));

    return (
      <Box>
        <Typography variant="h6" mt={2}>
          Entities
        </Typography>
        <Stack direction="row" spacing={2} mb={1}>
          <Button onClick={selectAllEntities} size="small">
            Select All
          </Button>
          <Button onClick={deselectAllEntities} size="small">
            Deselect All
          </Button>
        </Stack>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Select</TableCell>
                <TableCell>Entity Name</TableCell>
                <TableCell>Fields</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(processedData.entities).map((entity) => (
                <TableRow key={entity}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedEntities[entity] || false}
                      onChange={() => toggleEntitySelection(entity)}
                    />
                  </TableCell>
                  <TableCell>{entity}</TableCell>
                  <TableCell>
                    <Autocomplete
                      multiple
                      options={uniqueDefinitionOptions}
                      getOptionLabel={(option) => option.label}
                      value={entityFieldsOverrides[entity] || []}
                      onChange={(event, newValue) => {
                        setEntityFieldsOverrides((prev) => ({
                          ...prev,
                          [entity]: newValue,
                        }));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            {...getTagProps({ index })}
                            label={option.label}
                            icon={option.type === 'entity' ? <Boxes size={16} /> : undefined}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" size="small" />
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" mt={2}>
          Definitions
        </Typography>
        <Stack direction="row" spacing={2} mb={1}>
          <Button onClick={selectAllDefinitions} size="small">
            Select All
          </Button>
          <Button onClick={deselectAllDefinitions} size="small">
            Deselect All
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Select</TableCell>
                <TableCell>Definition Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Format</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(processedData.definitions).map((def) => (
                <TableRow key={def} disabled={Object.keys(availableDefinitions).map(
                  //lowercase
                  (d) => d.toLowerCase()
                ).includes(def.toLowerCase())}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={Object.keys(availableDefinitions).map(
                        //lowercase
                        (d) => d.toLowerCase()
                      ).includes(def.toLowerCase()) || selectedDefinitions[def] || false}
                      onChange={() => toggleDefinitionSelection(def)}
                    />
                  </TableCell>
                  <TableCell>{def}</TableCell>
                  <TableCell>
                    <TextField
                      value={definitionOverrides[def] || ''}
                      onChange={(e) =>
                        setDefinitionOverrides((prev) => ({
                          ...prev,
                          [def]: e.target.value,
                        }))
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      options={Object.keys(availableFormats) || []}
                      value={definitionFormatsOverrides[def] || ''}
                      onChange={(event, newValue) => {
                        setDefinitionFormatsOverrides((prev) => ({
                          ...prev,
                          [def]: newValue,
                        }));
                      }}
                      freeSolo
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" size="small" />
                      )}
                    />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={step === 3 ? 'xl' : 'sm'}>
      <DialogTitle>Import Files</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loading />
            <Typography variant="body1" mt={2}>
              {loadingMessage}
            </Typography>
          </Box>
        ) : (
          <>
            {step === 1 && renderIdentificationStep()}
            {step === 2 && renderProcessingStep()}
            {step === 3 && processedData && renderReviewTable()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {step === 1 && (
          <Button onClick={handleProcessFile} disabled={loading || files.length === 0}>
            Process File
          </Button>
        )}
        {step === 3 && (
          <Button onClick={handleImport} disabled={loading}>
            Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
