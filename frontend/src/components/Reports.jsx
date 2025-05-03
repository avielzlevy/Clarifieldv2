import React, { useState, useEffect, useMemo, useReducer } from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Badge,
} from "@mui/material";
import { X, Check, Book, FileJson, ChevronDown, Boxes } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { debounce } from "lodash";
import Loading from "./Loading";
import NoData from "./noData";

// Helper: returns the icon for each category.
const getIconForCategory = (category, theme) => {
  const icons = {
    format: <FileJson size={24} style={{ color: theme.palette.custom.bright }} />,
    definition: <Book size={24} style={{ color: theme.palette.custom.bright }} />,
    entity: <Boxes size={24} style={{ color: theme.palette.custom.bright }} />,
  };
  return icons[category] || null;
};


const initialExpandedState = {};
const expandedReducer = (state, action) => ({
  ...state,
  [action]: !state[action],
});

const ReportCard = React.memo(({ report, isExpanded, onToggleExpand, theme, t, refreshReports }) => {
  const statuses = useMemo(() => ["pending", "accepted", "rejected"], []);
  const statusColors = {
    pending: "#4a91e234",
    accepted: "#2ecc7034",
    rejected: "#e74d3c2e",
  };

  const descriptionsArray = useMemo(() => Array.isArray(report.descriptions) ? report.descriptions : [report.descriptions], [report.descriptions]);

  // Compute status counts
  const statusCounts = useMemo(() => {
    return descriptionsArray.reduce((acc, desc) => {
      if (desc?.status && statuses.includes(desc.status)) {
        acc[desc.status] = (acc[desc.status] || 0) + 1;
      }
      return acc;
    }, {});
  }, [descriptionsArray, statuses]);

  // Toggle selected statuses dynamically
  const [selectedStatuses, setSelectedStatuses] = useState(() => statuses.filter((s) => statusCounts[s] > 0));

  const toggleStatusFilter = (e, status) => {
    e.stopPropagation();
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const filteredDescriptions = useMemo(() => {
    return selectedStatuses.length
      ? descriptionsArray.filter((desc) => desc?.status && selectedStatuses.includes(desc.status))
      : descriptionsArray;
  }, [descriptionsArray, selectedStatuses]);

  // Handle report status update
  const updateReportStatus = debounce(async (report, desc, newStatus, refreshReports) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/report/${report.name}`, {
        type: report.category,
        name: report.name,
        description: desc.description,
        status: newStatus,
      });
      enqueueSnackbar(t('home.report_updated'), { variant: "success" });
      refreshReports();
    } catch (error) {
      enqueueSnackbar(t('home.error_updating_report'), { variant: "error" });
    }
  }, 300);
  const icon = useMemo(() => getIconForCategory(report.category, theme), [report.category, theme]);
  const handleUpdateStatus = (desc, newStatus) => {
    updateReportStatus(report, desc, newStatus, refreshReports);
  };
  const renderDescriptions = () =>

    filteredDescriptions.map((desc, idx) => (
      <Box
        key={idx}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          justifyContent: "space-between",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={t(`home.${desc?.status}`)}
            size="small"
            sx={{
              p: 1,
              height: "32px",
              backgroundColor: statusColors[desc?.status] || theme.palette.custom.light,
              color: theme.palette.text.primary,
              maxWidth: "25vw",
            }}
          />
          {desc?.description && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {desc.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Check size={24} style={{ color: theme.palette.success.main, cursor: "pointer" }} onClick={() => handleUpdateStatus(desc, "accepted")} />
          <X size={24} style={{ color: theme.palette.error.main, cursor: "pointer" }} onClick={() => handleUpdateStatus(desc, "rejected")} />
        </Box>
      </Box>
    ));


  return (
    <Card elevation={1} sx={{ mb: 2, bgcolor: theme.palette.background.default, width: "100%" }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="bold">
              {report.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, p: 1 }}>
              {statuses.map(
                (status) =>
                  statusCounts[status] > 0 && (
                    <Badge
                      key={status}
                      badgeContent={statusCounts[status]}
                      color={selectedStatuses.includes(status) ? "primary" : "default"}
                      onClick={(e) => toggleStatusFilter(e, status)}
                      sx={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        "& .MuiBadge-badge": {
                          backgroundColor: selectedStatuses.includes(status) ? statusColors[status] : "transparent",
                          color: theme.palette.text.primary,
                          border: selectedStatuses.includes(status) ? undefined : `1px solid ${statusColors[status]}`,
                          borderRadius: 3,
                        },
                      }}
                    />
                  )
              )}
            </Box>
          </Box>
        }
        sx={{ p: 1 }}
        avatar={icon}
        action={
          <IconButton onClick={() => onToggleExpand(report)}>
            <ChevronDown size={24} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
          </IconButton>
        }
      />
      <Divider />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        {renderDescriptions()}
      </Collapse>
    </Card>
  );
});

const Reports = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState({});
  const [loadingReports, setLoadingReports] = useState(true);
  const [expanded, dispatch] = useReducer(expandedReducer, initialExpandedState);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports`);
      setReportsData(data);
    } catch (err) {
      if (err.response?.status !== 404)
        enqueueSnackbar(t('home.error_fetching_reports'), { variant: "error" });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const combinedReports = useMemo(() => {
    return Object.entries(reportsData).flatMap(([category, reports]) =>
      Object.entries(reports || {}).map(([name, descriptions]) => ({ name, descriptions, category }))
    );
  }, [reportsData]);

  const filteredReports = useMemo(() => {
    return combinedReports.filter(
      (report) =>
        (activeFilters.definitions || report.category !== "definition") &&
        (activeFilters.entities || report.category !== "entity") &&
        (activeFilters.formats || report.category !== "format")
    );
  }, [combinedReports, activeFilters]);

  if (loadingReports) return <Loading />;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        {t("home.reports")}
      </Typography>
      {filteredReports.length > 0 ? (
        filteredReports.map((report) => (
          <ReportCard
            key={report.name}
            report={report}
            isExpanded={expanded[report.name]}
            onToggleExpand={() => dispatch(report.name)}
            theme={theme}
            t={t}
            refreshReports={fetchReports}
          />
        ))
      ) : (
        <NoData type="reports" />
      )}

    </Box>);
};

export default Reports;
