import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { theme } from '@/theme/theme';
import { AppRoutes } from '@/routes/AppRoutes';
import { SnackbarNotification } from '@/components/shared/SnackbarNotification';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppRoutes />
        <SnackbarNotification />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
