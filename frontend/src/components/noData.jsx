import React from 'react';
import { Box, Typography } from '@mui/material';
import { FileQuestion } from 'lucide-react'; // or any relevant icon
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const NoData = ({ type }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        textAlign: 'center',
        mt: 4,
        opacity: 0.6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <FileQuestion size={40} color={theme.palette.text.secondary} />
      <Typography variant="h6">{t(`home.${type}_empty`, `No ${type}`)}</Typography>
    </Box>
  );
};

export default NoData;
