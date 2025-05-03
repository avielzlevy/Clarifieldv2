import React, { useMemo,useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import {
  Boxes,
  Trash2 as Trash,
  Book,
  Plus
} from 'lucide-react';
import { useDefinitions } from '../contexts/useDefinitions';
import { useEntities } from '../contexts/useEntities';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const groupIconMap = {
  Definitions: <Book style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />,
  Entities: <Boxes style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />,
};


function EditEntityForm({ node, setNode}) {
  const theme = useTheme();
  const { t } = useTranslation();
  // Build grouped options from definitions and entities.
  const {definitions} = useDefinitions();
  const {entities} = useEntities();
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

  // Update a field's value and its type based on the selected option.
  const handleFieldChange = useCallback(
    (index, newValue) => {
      let label = '';
      let group = null;

      if (typeof newValue === 'object' && newValue !== null) {
        label = newValue.label;
        group = newValue.group;
      } else if (typeof newValue === 'string') {
        label = newValue;
        if (definitions[label]) {
          group = 'Definitions';
        } else if (entities[label]) {
          group = 'Entities';
        }
      }

      setNode((prevNode) => {
        const newFields = [...prevNode.fields];
        newFields[index] = {
          ...newFields[index],
          label,
          type: group === 'Definitions' ? 'definition' : group === 'Entities' ? 'entity' : 'unknown',
        };
        return { ...prevNode, fields: newFields };
      });
    },
    [setNode, definitions, entities]
  );


  // Adds an empty field.
  const addField = useCallback(() => {
    setNode((prevNode) => ({
      ...prevNode,
      fields: [...prevNode.fields, { label: '' }],
    }));
  }, [setNode]);

  // Removes a field at a given index.
  const removeField = useCallback(
    (index) => {
      setNode((prevNode) => ({
        ...prevNode,
        fields: prevNode.fields.filter((_, i) => i !== index),
      }));
    },
    [setNode]
  );

  const filteredOptions = useCallback((index) => {
    const selectedLabelsExceptCurrent = node.fields
      .filter((_, i) => i !== index)
      .map((f) => f.label);

    return options.filter(
      (option) => !selectedLabelsExceptCurrent.includes(option.label) && option.label !== node.label
    );
  }, [node.fields, options, node.label]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 250 }}>
        {node?.fields.map((field, index) => {

          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Autocomplete
                freeSolo
                options={filteredOptions(index)}
                groupBy={(option) => option.group || ''}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={field.label}
                onChange={(event, newValue) => handleFieldChange(index, newValue)}
                onInputChange={(event, newInputValue) =>
                  handleFieldChange(index, newInputValue)
                }
                renderInput={(params) => (
                  <TextField {...params} label={`${t('common.field')} ${index + 1}`} variant="outlined" fullWidth />
                )}
                // Render group headers with icons.
                renderGroup={(params) => {
                  const { key, group, children, ...rest } = params;
                  return (
                    <div key={key} {...rest}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: theme.palette.custom.light,
                        }}
                      >
                        {groupIconMap[group] || null}
                        <Typography sx={{ fontWeight: 'bold', ml: 1 }}>
                          {t(`navbar.${group.toLowerCase()}`)}
                        </Typography>
                      </Box>
                      {children}
                    </div>
                  );
                }}
                sx={{ flex: 1 }}
              />
              {node.fields.length > 1 && (
                <IconButton onClick={() => removeField(index)}>
                  <Trash />
                </IconButton>
              )}
            </Box>
          );
        })}
      <Button variant="outlined" startIcon={<Plus />} onClick={addField}>
        {t('common.add')} {t('common.field').toLowerCase()}
      </Button>
    </Box>
  );
}

export default EditEntityForm;
