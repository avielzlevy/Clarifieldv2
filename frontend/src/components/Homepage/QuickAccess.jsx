import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getAnalytics } from "../../utils/analytics";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Boxes, FileJson, Book } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import Loading from "../Loading";
import NoData from "../noData";

const QuickAccess = ({ activeFilters }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [mostUsedItems, setMostUsedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const crownColors = useMemo(() => ["#FFD700", "#C0C0C0", "#CD7F32"], []);

  const getCrownColor = useCallback(
    (index) => crownColors[index] || null,
    [crownColors]
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAnalytics();
        const combinedItems = Object.entries({
          ...(analytics.definition || {}),
          ...(analytics.entity || {}),
          ...(analytics.format || {}),
        }).map(([name, count]) => ({
          name,
          count,
          category: analytics.definition?.[name]
            ? "definition"
            : analytics.entity?.[name]
              ? "entity"
              : "format",
        }));


        setMostUsedItems(combinedItems.sort((a, b) => b.count - a.count));
      } catch (error) {
        console.error("Error fetching analytics:", error);
        enqueueSnackbar(t("home.error_fetching_popular"), { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [t]);

  const filteredItems = useMemo(
    () =>
      mostUsedItems.filter(
        (item) =>
          (activeFilters.definitions || item.category !== "definition") &&
          (activeFilters.entities || item.category !== "entity") &&
          (activeFilters.formats || item.category !== "format")
      ),
    [mostUsedItems, activeFilters]
  );

  const getCategoryIcon = useCallback(
    (category) => {
      const iconProps = { size: 16, style: { color: theme.palette.custom.bright } };
      return category === "format"
        ? <FileJson {...iconProps} />
        : category === "definition"
          ? <Book {...iconProps} />
          : <Boxes {...iconProps} />;
    },
    [theme]
  );

  if (loading) return <Loading />;
  if (!filteredItems.length) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("home.popular")}
        </Typography>
        <NoData type="popular" />
      </Box>
    );
  }


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold"}}>
          {t("home.popular")}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          height: "92.5%",
        }}
      >
        <List>
          {filteredItems.map(({ name, count, category }, index) => (
            <ListItem
              key={name}
              sx={{
                py: 0.5,
                px: 1,
                mb: 1,
                borderRadius: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                ":hover": {
                  transform: "scale(1.01)",
                  boxShadow: theme.shadows[2],
                },
                backgroundColor: theme.palette.background.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mr: 1 }}>
                  {index + 1}.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getCategoryIcon(category)}
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {name}
                      </Typography>
                    }
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {index < crownColors.length && <EmojiEventsIcon sx={{ color: getCrownColor(index) }} fontSize="small" />}
                <Typography variant="caption" color="textSecondary">
                  {count}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default QuickAccess;
