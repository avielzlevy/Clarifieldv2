import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useRtl } from "../contexts/RtlContext";

const ReportDialog = ({ open, onClose, reportedItem }) => {
  const { rtl } = useRtl();
  const [reportData, setReportData] = useState({
    type: "",
    name: "",
    description: "",
  });
  const { t } = useTranslation();
  // Memoize type to avoid unnecessary state updates
  const reportType = useMemo(
    () => (reportedItem?.pattern ? "format" : "definition"),
    [reportedItem]
  );

  // Sync reportData when reportedItem changes
  useEffect(() => {
    if (reportedItem) {
      setReportData((prev) => ({
        ...prev,
        type: reportType,
        name: reportedItem.name || "",
        description: "",
      }));
    }
  }, [reportedItem, reportType]);

  // Handle input change
  const handleDescriptionChange = useCallback((e) => {
    setReportData((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  // Submit report
  const submitReport = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/report/${reportData.name}`,
        {
          type: reportData.type,
          description: reportData.description.trim(),
        }
      );
      enqueueSnackbar(t('definitions.report_submitted'), { variant: "success" });
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      const errorMessage =
        error.response?.data?.message || t('error_submitting_report');
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  }, [reportData, onClose, t]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" PaperProps={{
      style: { direction: rtl ? "rtl" : "ltr" }
    }}>
      <DialogTitle>{t('definitions.report_submit')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('definitions.provide_description')}
        </DialogContentText>
        <TextField
          fullWidth
          variant="outlined"
          label={t('common.type')}
          value={reportData.type}
          disabled
          margin="normal"
        />
        <TextField
          fullWidth
          variant="outlined"
          label={t('common.name')}
          value={reportData.name}
          disabled
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          variant="outlined"
          label={t('common.description')}
          value={reportData.description}
          onChange={handleDescriptionChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            submitReport();
          }}
          variant="contained"
          color="primary"
          disabled={!reportData.description.trim()}
        >
          {t('common.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
