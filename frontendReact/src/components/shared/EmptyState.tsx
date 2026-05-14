import { Box, Typography, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No hay datos disponibles',
  icon 
}) => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {icon || <InboxIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Paper>
  );
};
