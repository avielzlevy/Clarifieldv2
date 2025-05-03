import React, { useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  TextField,
  Box,
  Autocomplete,
  IconButton,
  Button,
  Alert,
  Typography,
} from '@mui/material';
import { Trash2 as Trash, Plus, Book, Boxes } from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

const CreateEntityForm = ({ newEntity, setNewEntity, error }) => {
  const theme = useTheme();
  const { definitions } = useDefinitions();
  const { entities } = useEntities();
  const { t } = useTranslation();

  useEffect(() => {
    if (!newEntity.fields || newEntity.fields.length === 0) {
      setNewEntity((prev) => ({ ...prev, fields: [{ label: '' }] }));
    }
  }, [setNewEntity, newEntity.fields]);

  // Memoize the options for better performance
  const options = useMemo(() => {
    const defOptions = Object.keys(definitions).map((key) => ({
      label: key,
      group: 'Definitions',
    }));
    const entityOptions = Object.keys(entities).map((key) => ({
      label: key,
      group: 'Entities',
    }));
    return [...entityOptions, ...defOptions];
  }, [definitions, entities]);

  // Memoize group icon mapping to prevent unnecessary re-renders
  const groupIconMap = useMemo(
    () => ({
      Definitions: <Book sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
      Entities: <Boxes sx={{ fontSize: '1.2rem', mr: 0.5 }} />,
    }),
    []
  );

  // Handle field change with useCallback to avoid re-creation on renders
  const handleFieldChange = useCallback(
    (index, newValue) => {
      let label = '';
      let group = null;

      if (typeof newValue === 'object' && newValue !== null) {
        label = newValue.label;
        group = newValue.group;
      } else if (typeof newValue === 'string') {
        label = newValue;
        if (definitions.hasOwnProperty(newValue)) {
          group = 'Definitions';
        } else if (entities.hasOwnProperty(newValue)) {
          group = 'Entities';
        }
      }

      setNewEntity((prev) => {
        const newFields = [...prev.fields];
        newFields[index] = {
          ...newFields[index],
          label,
          type: group === 'Definitions' ? 'definition' : group === 'Entities' ? 'entity' : 'unknown',
        };
        return { ...prev, fields: newFields };
      });
    },
    [setNewEntity, definitions, entities]
  );

  const addField = useCallback(() => {
    setNewEntity((prev) => ({
      ...prev,
      fields: [...prev.fields, { label: '' }],
    }));
  }, [setNewEntity]);

  const removeField = useCallback(
    (index) => {
      setNewEntity((prev) => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index),
      }));
    },
    [setNewEntity]
  );

  const filteredOptions = useCallback(
    (index) => {
      const selectedLabelsExceptCurrent = newEntity.fields
        .filter((_, i) => i !== index)
        .map((f) => f.label);

      return options.filter(
        (option) => !selectedLabelsExceptCurrent.includes(option.label) && !(option.group === 'Entities' && option.label === newEntity.label)

      );
    },
    [newEntity.fields, options, newEntity.label]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <TextField
        label={`${t('common.entity')} ${t('common.name')}`}
        variant="outlined"
        fullWidth
        value={newEntity.label}
        onChange={(e) => setNewEntity((prev) => ({ ...prev, label: e.target.value }))}
        helperText={error}
        error={Boolean(error)}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 250 }}>
        {newEntity.fields.map((field, index) => {

          return (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Autocomplete
                freeSolo
                options={filteredOptions(index)}
                groupBy={(option) => option.group || ''}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={field.label}
                onChange={(event, newValue) => handleFieldChange(index, newValue)}
                onInputChange={(event, newInputValue) => handleFieldChange(index, newInputValue)}
                renderInput={(params) => (
                  <TextField {...params} label={`${t('common.field')} ${index + 1}`} variant="outlined" fullWidth />
                )}
                renderGroup={(params) => {
                  const { key, group, children, ...rest } = params;
                  return (
                    <div key={key} {...rest}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: theme.palette.custom.light }}>
                        {groupIconMap[group] || null}
                        <Typography sx={{ fontWeight: 'bold', ml: 1 }}>{group}</Typography>
                      </Box>
                      {children}
                    </div>
                  );
                }}
                sx={{ flex: 1 }}
              />
              {newEntity.fields.length > 1 && (
                <IconButton onClick={() => removeField(index)}>
                  <Trash />
                </IconButton>
              )}
            </Box>
          );
        })}
        <Button variant="outlined" startIcon={<Plus />} onClick={addField}>
          {`${t('common.add')} ${t('common.field')}`}
        </Button>
        {newEntity.fields.length === 0 && <Alert severity="warning">{t('minimum_one_field')}</Alert>}
      </Box>
    </Paper>
  );
};

export default CreateEntityForm;
