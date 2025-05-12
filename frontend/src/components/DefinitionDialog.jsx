import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import ChangeWarning from "./ChangeWarning";
import { useAffectedItems } from "../contexts/useAffectedItems";
import { useDefinitions } from "../contexts/useDefinitions";
import { useFormats } from "../contexts/useFormats";
import { useTranslation } from "react-i18next";

const DefinitionDialog = ({ mode, open, onClose, editedDefinition }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { fetchDefinitions } = useDefinitions();
  const { fetchFormats, formats } = useFormats();
  const { setRefreshSearchables } = useSearch();
  const { fetchAffectedItems, affected } = useAffectedItems();
  const token = localStorage.getItem("token");

  // form state
  const [definition, setDefinition] = useState({
    name: "",
    format: "",
    description: "",
  });

  // naming & validation
  const [namingConvention, setNamingConvention] = useState("");
  const [namingConventionError, setNamingConventionError] = useState("");

  const formatOptions = useMemo(() => Object.keys(formats), [formats]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNamingConvention(data.namingConvention);
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
      } else {
        console.error("Error fetching settings:", error);
        enqueueSnackbar(t("error_fetching_settings"), { variant: "error" });
      }
    }
  }, [logout, token, t]);

  // initialize on open / editedDefinition change
  useEffect(() => {
    fetchFormats();
    fetchSettings();

    if (mode === "edit" && editedDefinition) {
      setDefinition(editedDefinition);
      fetchAffectedItems({ name: editedDefinition.name, type: "definition" });
    } else {
      setDefinition({
        name: "",
        format: "",
        description: "",
      });
    }

  }, [mode, editedDefinition, fetchFormats, fetchSettings, fetchAffectedItems]);

  // validation (unchanged)
  const validateNamingConvention = useCallback(() => {
    if (!namingConvention) return true;
    const { name } = definition;
    switch (namingConvention) {
      case "snake_case":
        if (!/^[a-z0-9_]+$/.test(name)) {
          setNamingConventionError(
            `${t("definitions.bad_naming_convention")} ${t("common.snake_case")}`
          );
          return false;
        }
        break;
      case "camelCase":
        if (!/^[a-z]+([A-Z][a-z0-9]*)*$/.test(name)) {
          setNamingConventionError(
            `${t("definitions.bad_naming_convention")} ${t("common.camel_case")}`
          );
          return false;
        }
        break;
      case "PascalCase":
        if (!/^[A-Z][a-z]+([A-Z][a-z]*)*$/.test(name)) {
          setNamingConventionError(
            `${t("definitions.bad_naming_convention")} ${t("common.pascal_case")}`
          );
          return false;
        }
        break;
      case "kebab-case":
        if (!/^[a-z0-9-]+$/.test(name)) {
          setNamingConventionError(
            `${t("definitions.bad_naming_convention")} ${t("common.kebab_case")}`
          );
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }, [definition, namingConvention, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateNamingConvention()) return;

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/definitions${mode === "add" ? "" : `/${definition.name}`}`;
      const method = mode === "add" ? "post" : "put";
      await axios[method](url, definition, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchDefinitions();
      setRefreshSearchables((prev) => prev + 1);
      enqueueSnackbar(
        `${t("definitions.definition")} ${t(`common.${mode}ed`)} ${t("common.successfully")}`,
        { variant: "success" }
      );

      onClose();
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
      } else if (error.response?.status === 409) {
        enqueueSnackbar(t("definition_already_exists"), { variant: "error" });
      } else {
        console.error(`Error ${mode} definition:`, error);
        enqueueSnackbar(
          `${t("common.error")} ${t(`common.${mode}ing`)} ${t("definitions.definition")}`,
          { variant: "error" }
        );
      }
    } finally {
      // reset only the dynamic fields
      setDefinition((prev) => ({
        ...prev,
        name: "",
        format: "",
        description: "",
      }));
      setNamingConventionError("");
    }
  }, [
    definition,
    mode,
    fetchDefinitions,
    setRefreshSearchables,
    validateNamingConvention,
    logout,
    token,
    t,
    onClose,
  ]);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === 'Enter') {
        const tag = e.target.tagName.toLowerCase();
        const isTextArea = tag === 'textarea';

        if (!isTextArea) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    if (open) {
      window.addEventListener('keydown', listener);
    }

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [open, handleSubmit]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "add" ? t("common.add") : t("common.edit")} {t("common.definition")}
        {affected && <ChangeWarning items={affected} level="warning" />}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {mode === "add"
            ? t("definitions.fill_all_fields_1") + " " + t("common.add") + " " + t("common.definition") + "."
            : t("definitions.fill_all_fields_1") + " " + t("common.edit") + " " + t("common.definition") + "."}
        </DialogContentText>

        {/* Name */}
        <TextField
          label={t("common.name")}
          fullWidth
          margin="normal"
          value={definition.name}
          onChange={(e) => {
            setDefinition((prev) => ({ ...prev, name: e.target.value }));
            setNamingConventionError("");
          }}
          error={!!namingConventionError}
          helperText={namingConventionError}
          disabled={mode === "edit"}
        />

        {/* Format */}
        <Autocomplete
          options={formatOptions}
          getOptionLabel={(o) => o}
          value={definition.format}
          onChange={(_, v) => setDefinition((prev) => ({ ...prev, format: v || "" }))}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("common.format")}
              margin="normal"
              fullWidth
            />
          )}
        />

        {/* Description */}
        <TextField
          label={t("common.description")}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={definition.description}
          onChange={(e) =>
            setDefinition((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t("common.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefinitionDialog;
