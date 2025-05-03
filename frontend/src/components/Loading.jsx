import { Box } from "@mui/material";
import React from "react";

function Loading(props) {
    const { mode } = props;
  return (
    <Box
      sx={{
        position: mode === 'full' ? "fixed" : undefined,
        top: mode === 'full' ? 0 : undefined,
        left: mode === 'full' ? 0 : undefined,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: mode === 'full' ? "100vh" : "100%",
        width: mode === 'full' ? "100vw" : "100%",
        flexGrow: 1,
        backgroundColor: "rgba(255, 255, 255, 0.562)",
        backdropFilter: "blur(10px)",
        zIndex: 99999,
      }}
    >
      <Box
        sx={{
          width: "40px", // You can change to "100px" or any desired size
          height: "40px", // Likewise, adjust as needed
          animation: "pulse 2.2s infinite ease-in-out",
          backgroundImage: 'url("/favicon.ico")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain", // Adjust this if needed
          // You can also adjust your keyframes if necessary
          "@keyframes pulse": {
            "0%": {
              transform: "scale(1)",
              opacity: 1,
            },
            "50%": {
              transform: "scale(0.8)",
              opacity: 0.7,
            },
            "100%": {
              transform: "scale(1)",
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
}

export default Loading;
