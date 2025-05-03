import React, { useState, useMemo, useCallback } from "react";
import {
  IconButton,
  Badge,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  ClickAwayListener,
  ListItemIcon,
} from "@mui/material";
import { X, AlertCircle, ShieldAlert, Boxes, Book } from "lucide-react";
import { useDefinitions } from "../contexts/useDefinitions";
import { useFormats } from "../contexts/useFormats";
import { useEntities } from "../contexts/useEntities";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

export default function Problems() {
  const [isOpen, setIsOpen] = useState(false);
  const { formats } = useFormats();
  const { definitions } = useDefinitions();
  const { entities } = useEntities();
  const theme = useTheme();
  const { t } = useTranslation();

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  // Memoized problem list generation
  const problems = useMemo(() => {
    const formatIssues = Object.entries(definitions)
      .filter(([_, def]) => !formats[def.format])
      .map(([key, def]) => ({
        type: "definition-format",
        message: `Definition '${key}' uses missing format '${def.format}'.`,
      }));

    const entityIssues = Object.entries(entities).flatMap(([key, entity]) =>
      entity.fields
        .filter(
          (field) =>
            (field.type === "definition" && !definitions[field.label]) ||
            (field.type === "entity" && !entities[field.label])
        )
        .map((field) => ({
          type: "entity-reference",
          message: `Entity '${key}' references missing ${field.type} '${field.label}'.`,
        }))
    );

    return [...formatIssues, ...entityIssues];
  }, [definitions, formats, entities]);

  const totalProblems = problems.length;

  const getProblemIcon = (type) => {
    switch (type) {
      case "definition-format":
        return <Book color={theme.palette.custom.bright} />;
      case "entity-reference":
        return <Boxes color={theme.palette.custom.bright} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Notification Badge */}
      <IconButton
        onClick={toggleOpen}
        aria-label="Toggle problems menu"
        disabled={totalProblems === 0}
        color="inherit"
      >
        <Badge badgeContent={totalProblems} color="error" invisible={totalProblems === 0}>
          <ShieldAlert size={24} style={{ 'display': totalProblems > 0 ? "block" : "none" }} />
        </Badge>
      </IconButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)} dir='ltr'>
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              right: 0,
              mt: 1,
              width: "auto",
              zIndex: 10,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AlertCircle size={24} />
                <Typography variant="h6">{t('navbar.problems')}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
                <X size={20} />
              </IconButton>
            </Box>

            {/* Description */}
            <Box sx={{ p: 2, bgcolor: "error.light" }}>
              <Typography variant="body2" color="white">
                {totalProblems} {t('navbar.problem_need')}
                {totalProblems === 1 ? "s" : ""} {t('navbar.attention')}
              </Typography>
            </Box>

            {/* List of Problems */}
            <List sx={{ maxHeight: 400, overflowY: "auto" }}>
              {problems.map((problem, index) => (
                <Box key={index} dir='ltr' sx={{
                  textAlign: 'left',
                }}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 35 }}>{getProblemIcon(problem.type)}</ListItemIcon>
                    <ListItemText
                      dir='ltr'
                      sx={{
                        display: "flex",
                        alignItems: "left",
                        gap: 1,
                      }}
                      primary={problem.message}
                      slotProps={{
                        primary: {
                          variant: "body2",
                          color: "text.secondary",
                          sx: {
                            overflow: "hidden",
                            whiteSpace:
                              "nowrap",
                            textOverflow: "ellipsis",
                          },
                        }
                      }}
                    />
                  </ListItem>
                  {index < problems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2, bgcolor: "grey.100", textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                {t('navbar.review_and_update')}
              </Typography>
            </Box>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
}
