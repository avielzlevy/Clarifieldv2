import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Book, Boxes, FileJson } from "lucide-react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

const BASE_API_URL = process.env.REACT_APP_API_URL;

const FilterToolbar = ({ activeFilters, toggleFilter }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [itemsAmount, setItemsAmount] = useState({ formats: 0, definitions: 0, entities: 0 });

  useEffect(() => {
    const fetchItemsAmount = async () => {
      try {
        const [definitionsRes, formatsRes, entitiesRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/api/definitions/amount`),
          axios.get(`${BASE_API_URL}/api/formats/amount`),
          axios.get(`${BASE_API_URL}/api/entities/amount`),
        ]);

        setItemsAmount({
          definitions: definitionsRes.data.amount || 0,
          formats: formatsRes.data.amount || 0,
          entities: entitiesRes.data.amount || 0,
        });
      } catch (error) {
        console.error("Error fetching items amount:", error);
        enqueueSnackbar(t('home.error_fetching_items'), { variant: "error" });
      }
    };

    fetchItemsAmount();
  }, [enqueueSnackbar,t]);

  const handleToggleFilter = useCallback((filterType) => {
    toggleFilter(filterType);
  }, [toggleFilter]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
      <Paper elevation={3} sx={{ p: 1, borderRadius: 4, display: "flex", gap: 2 }}>
        <ToolbarItem
          icon={Boxes}
          label={t('navbar.entities')}
          count={itemsAmount.entities}
          isActive={activeFilters.entities}
          onClick={() => handleToggleFilter("entities")}
        />
        <ToolbarItem
          icon={Book}
          label={t('navbar.definitions')}
          count={itemsAmount.definitions}
          isActive={activeFilters.definitions}
          onClick={() => handleToggleFilter("definitions")}
        />
        <ToolbarItem
          icon={FileJson}
          label={t('navbar.formats')}
          count={itemsAmount.formats}
          isActive={activeFilters.formats}
          onClick={() => handleToggleFilter("formats")}
        />
      </Paper>
    </Box>
  );
};

const ToolbarItem = ({ icon: Icon, label, count, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 3,
        py: 2,
        borderRadius: 2,
        transition: "all 0.3s ease",
        cursor: "pointer",
        bgcolor: isActive ? theme.palette.custom.light : "transparent",
        color: isActive ? theme.palette.custom.bright : "inherit",
        "&:hover": {
          bgcolor: isActive ? theme.palette.custom.dark : theme.palette.custom.light,
          transform: "scale(1.02)",
        },
      }}
    >
      <Icon size={20} />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
};

export default FilterToolbar;
