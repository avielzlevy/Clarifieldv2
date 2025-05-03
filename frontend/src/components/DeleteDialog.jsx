import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import ChangeWarning from './ChangeWarning';
import { useAffectedItems } from '../contexts/useAffectedItems';
import { useTranslation } from 'react-i18next';

const DeleteDialog = ({ open, onClose, deletedItem, onDelete, type }) => {
  const { affected, fetchAffectedItems } = useAffectedItems();
  const { t } = useTranslation();
  const [sure, setSure] = useState(false);
  const hasAffectedItems = !!affected; // Memoized check for reusability

  // Fetch affected items when dialog opens
  useEffect(() => {
    if (open && deletedItem) {
      fetchAffectedItems({ name: deletedItem.name, type });
    }
  }, [open, deletedItem, type, fetchAffectedItems]);

  // Reset confirmation state when dialog closes
  useEffect(() => {
    if (!open) {
      setSure(false);
    }
  }, [open]);

  // Handle delete click
  const handleDeleteClick = useCallback(() => {
    if (deletedItem) {
      onDelete(deletedItem);
    }
  }, [deletedItem, onDelete]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {t('common.delete_confirmation')}
        {hasAffectedItems && <ChangeWarning items={affected} level="error" />}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('common.delete_sure')} <strong>{deletedItem?.name}</strong>? {t('common.cannot_be_undone')}
        </DialogContentText>
        {hasAffectedItems && (
          <FormControlLabel
            sx={{ mr: 0.2 }}
            control={
              <Checkbox
                checked={sure}
                onChange={() => setSure((prev) => !prev)}
              />
            }
            label={t('common.sure')}
            labelPlacement="start"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleDeleteClick}
          variant="contained"
          color="error"
          disabled={hasAffectedItems && !sure}
        >
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
