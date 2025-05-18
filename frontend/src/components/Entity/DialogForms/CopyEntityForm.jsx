import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";

function CopyEntityForm({ node, onCheckChange }) {
  const fields = node?.fields || [];
  const [checked, setChecked] = useState([]);
  const { t } = useTranslation();

  // Quick lookup for which labels are checked
  const checkedMap = useMemo(
    () => new Set(checked.map((item) => item.label)),
    [checked]
  );

  // Determine "select all" checkbox state
  const allChecked = fields.length > 0 && checked.length === fields.length;
  const someChecked = checked.length > 0 && checked.length < fields.length;

  const handleCheckboxChange = useCallback(
    (field) => {
      setChecked((prev) => {
        const isChecked = prev.some((item) => item.label === field.label);
        const newChecked = isChecked
          ? prev.filter((item) => item.label !== field.label)
          : [...prev, field];
        onCheckChange(newChecked);
        return newChecked;
      });
    },
    [onCheckChange]
  );

  const handleSelectAllChange = useCallback(
    (event) => {
      if (event.target.checked) {
        setChecked(fields);
        onCheckChange(fields);
      } else {
        setChecked([]);
        onCheckChange([]);
      }
    },
    [fields, onCheckChange]
  );

  return (
    <Box>
      {/* Select All Section */}
      <Box sx={{ mb: 1, px: 1, display: "flex", alignItems: "center" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={handleSelectAllChange}
            />
          }
          label={
            <Typography variant="subtitle2" fontWeight="bold">
              {t("common.select_all")} ({fields.length})
            </Typography>
          }
        />
      </Box>

      <Divider />

      {/* Individual Field Checkboxes */}
      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
        {fields.map((field) => (
          <FormControlLabel
            key={field.label}
            control={
              <Checkbox
                checked={checkedMap.has(field.label)}
                onChange={() => handleCheckboxChange(field)}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography>{field.label}</Typography>
                {field.type === "entity" && (
                  <Boxes
                    style={{
                      height: 16,
                      width: 16,
                      color: "primary.main",
                      marginLeft: "10px",
                    }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Box>
    </Box>
  );
}

export default CopyEntityForm;
