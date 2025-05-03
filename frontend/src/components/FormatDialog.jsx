import React, { useState, useEffect, useCallback } from "react";
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
import ChangeWarning from "../components/ChangeWarning";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import { useAffectedItems } from "../contexts/useAffectedItems";
import { useFormats } from "../contexts/useFormats";
import RegexBuilderDialog from "./RegexBuilderDialog";

const FormatDialog = ({
  mode,
  open,
  onClose,
  editedFormat,
}) => {
  const [format, setFormat] = useState({ name: "", pattern: "", description: "" });
  const [patternError, setPatternError] = useState("");
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const { affected, fetchAffectedItems } = useAffectedItems();
  const { fetchFormats } = useFormats();
  const [regexBuilderDialogOpen, setRegexBuilderDialogOpen] = useState(false);
  // Reset format to default
  const resetFormat = useCallback(() => {
    setFormat({ name: "", pattern: "", description: "" });
  }, []);

  // Update form when editedFormat changes
  useEffect(() => {
    if (editedFormat && mode === "edit") {
      setFormat(editedFormat);
      fetchAffectedItems({ name: editedFormat.name, type: 'format' });
    } else {
      resetFormat();
    }
  }, [editedFormat, resetFormat, fetchAffectedItems, mode]);

  // Validate that the pattern starts with ^ and ends with $, and is a valid regex.
  const validatePattern = useCallback(() => {
    if (!format.pattern.startsWith("^") || !format.pattern.endsWith("$")) {
      setPatternError(t("pattern_boundaries_error"));
      return false;
    }
    try {
      new RegExp(format.pattern);
    } catch (e) {
      setPatternError(t("pattern_invalid_error"));
      return false;
    }
    return true;
  }, [format.pattern, t]);

  const handleSubmit = useCallback(async () => {
    if (!validatePattern()) return;

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/formats${mode === "add" ? "" : `/${format.name}`
        }`;
      const method = mode === "add" ? "post" : "put";
      await axios[method](url, format, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFormats();
      resetFormat();
      onClose();
      setRefreshSearchables((prev) => prev + 1);
      enqueueSnackbar(`${t("common.format")} ${t(`common.${mode}`)} ${t("common.successfully")}`, { variant: "success" });
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
        return;
      } else if (error.response?.status === 403) {
        enqueueSnackbar(t("static_format_edit_error"), { variant: "error" });
        onClose();
      } else {
        console.error(
          `Error ${mode === "add" ? "adding" : "editing"} format:`,
          error
        );
        enqueueSnackbar(`${t("common.error")} ${t(`common.${mode}ing`)} ${t("common.format")}`, { variant: "error" });
      }
      resetFormat();
    }
  }, [
    format,
    mode,
    token,
    onClose,
    fetchFormats,
    setRefreshSearchables,
    validatePattern,
    logout,
    resetFormat,
    t,
  ]);

  const handleCancel = useCallback(() => {
    resetFormat();
    onClose();
  }, [onClose, resetFormat]);

  const handlePatternChange = useCallback((e) => {
    setFormat((prev) => ({ ...prev, pattern: e.target.value }));
    setPatternError("");
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "add" ? "Add Format" : "Edit Format"}
        {affected && mode !== 'add' && <ChangeWarning items={affected} level="warning" />}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{
          whiteSpace: "pre-line",
          fontSize: "1rem",
        }}>
          {
            `${t("formats.fill_all_fields")} ${t(`common.${mode}`)} ${t("common.format")} ${'\n'} ${t("formats.pattern_must")}`
          }
        </DialogContentText>
        <TextField
          label={t("common.name")}
          disabled={mode === "edit"}
          fullWidth
          margin="normal"
          value={format.name}
          onChange={(e) =>
            setFormat((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <TextField
          label={t("formats.pattern")}
          fullWidth
          margin="normal"
          value={format.pattern}
          onChange={handlePatternChange}
          error={!!patternError}
          helperText={patternError}
        />
        <TextField
          label={t("common.description")}
          fullWidth
          margin="normal"
          value={format.description}
          onChange={(e) =>
            setFormat((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t("common.save")}
        </Button>
      </DialogActions>
      <RegexBuilderDialog open={regexBuilderDialogOpen} setOpen={setRegexBuilderDialogOpen} setFormat={setFormat} defaultPattern={format.pattern} />
    </Dialog>
  );
};

export default FormatDialog;
