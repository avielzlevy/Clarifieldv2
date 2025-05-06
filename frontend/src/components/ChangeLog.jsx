import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
// ← import the locales you need
import { enUS, he, de, ar, fr, es } from "date-fns/locale";
import { Boxes, FileJson, Book } from "lucide-react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import Loading from "./Loading";
import NoData from "./noData";

const ChangeLog = ({ activeFilters }) => {
  const [changeData, setChangeData] = useState({ formats: [], definitions: [], entities: [] });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const { t, i18n } = useTranslation();  // ← grab i18n from the hook
  const theme = useTheme();

  // map your i18n codes to date-fns locales
  const localeMap = useMemo(
    () => ({
      en: enUS,
      he: he,
      de: de,
      ar: ar,
      fr: fr,
      es: es,
    }),
    []
  );
  const currentLocale = localeMap[i18n.language] || enUS;

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/changes`);
        if (data?.formats || data?.definitions || data?.entities) {
          setChangeData({
            formats: data.formats || [],
            definitions: data.definitions || [],
            entities: data.entities || [],
          });
        }
      } catch (error) {
        console.error("Error fetching change log:", error);
        enqueueSnackbar(t("home.error_fetching_recent"), { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchChangeLog();
  }, [t]);

  const combinedLogs = useMemo(() => {
    let logs = [
      ...changeData.formats.map((item) => ({ ...item, category: "format" })),
      ...changeData.definitions.map((item) => ({ ...item, category: "definition" })),
      ...changeData.entities.map((item) => ({ ...item, category: "entity" })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return logs.filter(
      (log) =>
        (activeFilters.definitions || log.category !== "definition") &&
        (activeFilters.formats || log.category !== "format") &&
        (activeFilters.entities || log.category !== "entity")
    );
  }, [changeData, activeFilters]);

  const handleItemClick = useCallback((log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedLog(null);
  }, []);

  const getCategoryIcon = (category) => {
    const iconProps = { size: 16, style: { color: theme.palette.custom.bright } };
    switch (category) {
      case "format":
        return <FileJson {...iconProps} />;
      case "definition":
        return <Book {...iconProps} />;
      case "entity":
        return <Boxes {...iconProps} />;
      default:
        return null;
    }
  };

  if (loading) return <Loading />;
  if (!combinedLogs.length) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("home.recent")}
          <NoData type="recent" />
        </Typography>
      </Box>
    );
  }

  const renderChangeLogList = () => (
    <List sx={{ overflow: "auto" }}>
      {combinedLogs.map(({ name, timestamp, before, after, userName, category }, index) => {
        const changeType = before === "" ? "created" : after === "" ? "deleted" : "updated";
        const timeAgo = formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
          locale: currentLocale, // ← pass the locale
        });

        return (
          <ListItemButton
            key={index}
            onClick={() => handleItemClick({ name, timestamp, before, after, userName, category })}
            sx={{
              borderRadius: 1,
              mb: 1,
              backgroundColor: theme.palette.background.default,
              "&:hover": { backgroundColor: theme.palette.custom.light },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ListItemText
                primary={
                  <>
                    {userName || t("navbar.admin")} {t(`common.${changeType}`)}{" "}
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                      <Typography component="span" fontWeight={600}>
                        {name}
                      </Typography>
                      {getCategoryIcon(category)}
                    </Box>
                  </>
                }
                secondary={timeAgo}
              />
            </Box>
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("home.recent")}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{renderChangeLogList()}</Box>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedLog ? `${t("home.details_for")} ${selectedLog.name}` : t("home.change_details")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {/* use the same locale for the full timestamp */}
                {`${t("common.timestamp")}: ${new Date(selectedLog.timestamp).toLocaleString(i18n.language)}`}
              </Typography>
              {selectedLog.before && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="error.main" fontWeight="bold">
                    {t("home.before")}:
                  </Typography>
                  <Box
                    component="pre"
                    dir='ltr'
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {JSON.stringify(selectedLog.before, null, 2)}
                  </Box>
                </Box>
              )}
              {selectedLog.after && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {t("home.after")}:
                  </Typography>
                  <Box
                    component="pre"
                    dir="ltr"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      p: 1,
                      borderRadius: 1,
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {JSON.stringify(selectedLog.after, null, 2)}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("common.close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeLog;
