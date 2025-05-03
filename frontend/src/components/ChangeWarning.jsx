import React, { useMemo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from 'react-i18next';

function ChangeWarning({ items, level }) {
  const { t } = useTranslation();
  // Helper function to format items into a readable tooltip
  const formatTooltipText = (items) => {
    return Object.entries(items)
      .map(([key, values]) => `${key}:\n${values.map((v) => `- ${v}`).join('\n')}`)
      .join('\n\n');
  };

  // Memoize the tooltip message for performance optimization
  const message = useMemo(() => {
    const tooltipText = formatTooltipText(items);
    return `${t('common.change_warning_1')} ${
      level === 'warning' ? 'affect' : 'break'
  } ${t('common.change_warning_2')}${tooltipText}`;
  }, [items, level,t]);

  return (
    <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{message}</span>}>
      <IconButton color={level === 'warning' ? 'warning' : 'error'} aria-label="warning">
        <WarningIcon />
      </IconButton>
    </Tooltip>
  );
}

export default ChangeWarning;
