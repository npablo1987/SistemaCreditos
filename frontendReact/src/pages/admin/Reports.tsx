import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { reportService } from '@/services/report.service';
import { MonthlyReport } from '@/models/report.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Reports: React.FC = () => {
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    loadReport();
  }, [selectedYear, selectedMonth]);

  const loadReport = async () => {
    try {
      const data = await reportService.getMonthly(selectedYear, selectedMonth);
      setMonthlyReport(data);
    } catch (error) {
      showSnackbar('Error al cargar reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!monthlyReport) return null;

  const lineData = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      {
        label: 'Préstamos Otorgados',
        data: [0, 0, 0, monthlyReport.total_loaned],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Pagos Recibidos',
        data: [0, 0, 0, monthlyReport.total_paid],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ['Aprobados', 'Rechazados', 'Intereses'],
    datasets: [
      {
        label: 'Cantidad / Monto',
        data: [
          monthlyReport.loans_approved,
          monthlyReport.loans_rejected,
          monthlyReport.interest_earned,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reportes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análisis detallado de préstamos y pagos
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            select
            label="Año"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Mes"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ minWidth: 150 }}
          >
            {months.map((month, index) => (
              <MenuItem key={index} value={index + 1}>
                {month}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Prestado
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                ${monthlyReport.total_loaned.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Pagado
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                ${monthlyReport.total_paid.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Intereses Ganados
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                ${monthlyReport.interest_earned.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Cuotas Pendientes
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {monthlyReport.pending_installments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tendencia Mensual
              </Typography>
              <Line data={lineData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Préstamos
              </Typography>
              <Bar data={barData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
