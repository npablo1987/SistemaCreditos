import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  CheckCircle,
  People,
  AttachMoney,
  PendingActions,
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { reportService } from '@/services/report.service';
import { loanService } from '@/services/loan.service';
import { userService } from '@/services/user.service';
import { DashboardReport } from '@/models/report.model';
import { Loan, LoanStatus } from '@/models/loan.model';
import { User } from '@/models/user.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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

export const AdminDashboard: React.FC = () => {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportData, loansData, usersData] = await Promise.all([
        reportService.getDashboard(),
        loanService.getAll(),
        userService.getAll(),
      ]);
      setReport(reportData);
      setLoans(loansData);
      setUsers(usersData);
    } catch (error) {
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!report) return null;

  // Calcular estadísticas reales
  const totalLoans = loans.length;
  const pendingLoans = loans.filter(l => l.status === LoanStatus.SOLICITADO).length;
  const activeLoans = loans.filter(l => l.status === LoanStatus.DEPOSITADO).length;
  const completedLoans = loans.filter(l => l.status === LoanStatus.TERMINADO).length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  
  const totalLent = Number(report.total_lent || 0);
  const totalPaid = Number(report.total_paid || 0);

  const barData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Préstamos Depositados',
        data: [0, 0, 0, 0, 0, totalLent],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Pagos Recibidos',
        data: [0, 0, 0, 0, 0, totalPaid],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Pendientes', 'Activos', 'Completados'],
    datasets: [
      {
        data: [pendingLoans, activeLoans, completedLoans],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard Administrativo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Resumen general del sistema de créditos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Usuarios"
            value={totalUsers}
            icon={<People sx={{ color: 'white', fontSize: 32 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Usuarios Activos"
            value={activeUsers}
            icon={<People sx={{ color: 'white', fontSize: 32 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Préstamos"
            value={totalLoans}
            icon={<AccountBalanceWallet sx={{ color: 'white', fontSize: 32 }} />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Solicitudes Pendientes"
            value={pendingLoans}
            icon={<PendingActions sx={{ color: 'white', fontSize: 32 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Préstamos Activos"
            value={activeLoans}
            icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Préstamos Completados"
            value={completedLoans}
            icon={<CheckCircle sx={{ color: 'white', fontSize: 32 }} />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Prestado"
            value={`$${totalLent.toLocaleString()}`}
            icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Recibido"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
            color="#f57c00"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Movimientos Financieros
              </Typography>
              <Bar data={barData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Préstamos
              </Typography>
              <Doughnut data={doughnutData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
