import React, { useCallback } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DeleteEntityForm = ({ node: { label }, sureDelete, setSureDelete }) => {
  const { t } = useTranslation();
  const handleCheckboxChange = useCallback(() => {
    setSureDelete((prev) => !prev);
  }, [setSureDelete]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
        minWidth: 250,
      }}
    >
      <Typography variant="body1">
        {t('entities.delete_entity_sure')} "{label}"? {t('common.cannot_be_undone')}
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={sureDelete}
            onChange={handleCheckboxChange}
            inputProps={{ 'aria-label': 'Confirm entity deletion' }}
          />
        }
        label={t('entities.delete_entity_confirm')}
      />
    </Box>
  );
}

export default React.memo(DeleteEntityForm);
