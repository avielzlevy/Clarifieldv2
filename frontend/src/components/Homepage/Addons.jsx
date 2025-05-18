import React from "react";
import {
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CodeIcon from "@mui/icons-material/Code";
import JsonIcon from "@mui/icons-material/DataObject"; // Assuming you have this or use any JSON icon
import DescriptionIcon from "@mui/icons-material/Description";
import HtmlIcon from "@mui/icons-material/Language";
import CssIcon from "@mui/icons-material/Style";
import JavaScriptIcon from "@mui/icons-material/Javascript";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
//TODO: find a place for this
const Addons = ({ files }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    // Function to get the appropriate icon based on file extension
    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        switch (extension) {
            case "ts":
                return <CodeIcon fontSize="large" color="action" />; // TypeScript file icon
            case "json":
                return <JsonIcon fontSize="large" color="action" />; // JSON file icon
            case "txt":
                return <DescriptionIcon fontSize="large" color="action" />; // Text file icon
            case "html":
                return <HtmlIcon fontSize="large" color="action" />; // HTML file icon
            case "css":
                return <CssIcon fontSize="large" color="action" />; // CSS file icon
            case "js":
                return <JavaScriptIcon fontSize="large" color="action" />; // JavaScript file icon
            default:
                return <InsertDriveFileIcon fontSize="large" color="action" />; // Default file icon
        }
    };

    const handleFileDownload = (file) => {
        const getMimeType = (fileName) => {
            const extension = fileName.split(".").pop().toLowerCase();
            switch (extension) {
                case "ts":
                    return "application/typescript";
                case "json":
                    return "application/json";
                case "txt":
                    return "text/plain";
                case "html":
                    return "text/html";
                case "css":
                    return "text/css";
                case "js":
                    return "application/javascript";
                case "xml":
                    return "application/xml";
                case "csv":
                    return "text/csv";
                default:
                    return "application/octet-stream";
            }
        };

        const mimeType = getMimeType(file.fileName);

        const byteCharacters = atob(file.fileData.base64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const blob = new Blob([byteNumbers], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.fileName;
        link.click();

        URL.revokeObjectURL(blobUrl);
    };

    if (!files || files.length === 0) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                    {t("addons")}
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                <Typography color="textSecondary">{t("addons_empty")}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{
                display: "flex",
                justifyContent: 'center',
            }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                    {t("addons")}
                </Typography>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    padding: 2,
                    backgroundColor: theme.palette.background.default !== "#fff" ? theme.palette.background.default : "#e9e9e9",
                    borderRadius: 2,
                    height: "92.5%",
                }}
            >
                <List>
                    {files.map((file, index) => (
                        <ListItem
                            key={index}
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
                                backgroundColor: theme.palette.background.paper !== "#fff" ? theme.palette.background.paper : "#e9e9e9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ListItemIcon sx={{ minWidth: "40px" }}>
                                    {getFileIcon(file.fileName)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: theme.palette.primary.main,
                                            }}
                                        >
                                            {file.fileName}
                                        </Typography>
                                    }
                                />
                            </Box>

                            <IconButton
                                onClick={() => handleFileDownload(file)}
                                aria-label="Download file"
                                sx={{ color: theme.palette.primary.main }}
                            >
                                <CloudDownloadIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default Addons;
