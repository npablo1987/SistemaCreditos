import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  Payment,
  Schedule,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { loanService } from '@/services/loan.service';
import { Loan } from '@/models/loan.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const UserDashboard: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await loanService.getAll();
      setLoans(data);
    } catch (error: any) {
      showSnackbar('Error al cargar préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const activeLoans = loans.filter((l) => l.status === 'DEPOSITADO');
  const currentLoan = activeLoans[0];
  
  const totalAmount = activeLoans.reduce((sum, loan) => sum + Number(loan.amount), 0);
  const totalPending = activeLoans.reduce(
    (sum, loan) => sum + Number(loan.remaining_amount || loan.total_amount || loan.amount),
    0
  );
  const totalPaid = activeLoans.reduce(
    (sum, loan) => sum + (loan.paid_installments || 0) * Number(loan.installment_amount || 0),
    0
  );

  const chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Pagos Realizados',
        data: [0, 0, 0, 0, 0, totalPaid],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Historial de Pagos',
      },
    },
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Resumen de tus préstamos y pagos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Préstamo Actual"
            value={`$${currentLoan?.amount.toLocaleString() || 0}`}
            icon={<AccountBalanceWallet sx={{ color: 'white', fontSize: 32 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monto Pendiente"
            value={`$${totalPending.toLocaleString()}`}
            icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cuotas Pagadas"
            value={currentLoan?.paid_installments || 0}
            icon={<Payment sx={{ color: 'white', fontSize: 32 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cuotas Restantes"
            value={
              currentLoan
                ? currentLoan.number_of_installments - (currentLoan.paid_installments || 0)
                : 0
            }
            icon={<Schedule sx={{ color: 'white', fontSize: 32 }} />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximo Pago
              </Typography>
              {currentLoan ? (
                <Box>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    ${currentLoan.installment_amount ? Number(currentLoan.installment_amount).toLocaleString() : '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Fecha estimada: {new Date(currentLoan.payment_start_date).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No hay préstamos activos
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen Total
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Prestado:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${totalAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Pagado:</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    ${totalPaid.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Saldo Pendiente:</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    ${totalPending.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
