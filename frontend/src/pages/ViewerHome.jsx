import React, { useState,useCallback } from "react";
import { Box, Paper } from "@mui/material";
import ChangeLog from "../components/ChangeLog";
import QuickAccess from "../components/QuickAccess";
import FilterToolbar from "../components/FilterToolbar";


const ViewerHomepage = () => {
  // Active filters state – all active by default
  const [activeFilters, setActiveFilters] = useState({
    entities: true,
    definitions: true,
    formats: true,
  });

  // Toggle filter state
  const toggleFilter = useCallback((filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  }, []);

  console.log(`                                                                          
    _____       _        _____        _____     _     _    __                
   |     |___ _| |___   | __  |_ _   |  _  |_ _|_|___| |  |  |   ___ _ _ _ _ 
   | | | | .'| . | -_|  | __ -| | |  |     | | | | -_| |  |  |__| -_| | | | |
   |_|_|_|__,|___|___|  |_____|_  |  |__|__|\\_/|_|___|_|  |_____|___|\\_/|_  |
                              |___|                                     |___|
   `);

  return (
    <>
      <FilterToolbar activeFilters={activeFilters} toggleFilter={toggleFilter} />
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <Paper sx={{ p: 1, minWidth: "25vw", width: "50%", height: "70vh" }}>
          <ChangeLog activeFilters={activeFilters} />
        </Paper>
        <Paper sx={{ p: 1, minWidth: "25vw", width: "50%", height: "70vh" }}>
          <QuickAccess activeFilters={activeFilters} />
        </Paper>
      </Box>
    </>
  );
};

export default ViewerHomepage;
