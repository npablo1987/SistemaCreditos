import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { loanService } from '@/services/loan.service';
import { Loan, LoanStatus } from '@/models/loan.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSnackbarStore } from '@/store/notification.store';

const getStatusColor = (status: LoanStatus) => {
  switch (status) {
    case LoanStatus.SOLICITADO:
      return 'warning';
    case LoanStatus.DEPOSITADO:
      return 'success';
    case LoanStatus.TERMINADO:
      return 'default';
    default:
      return 'default';
  }
};

export const MyLoans: React.FC = () => {
  const navigate = useNavigate();
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
    } catch (error) {
      showSnackbar('Error al cargar préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Mis Préstamos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Historial de tus solicitudes de préstamo
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/loans/request')}
        >
          Solicitar Préstamo
        </Button>
      </Box>

      {loans.length === 0 ? (
        <EmptyState message="No tienes préstamos registrados" />
      ) : (
        <Grid container spacing={3}>
          {loans.map((loan) => (
            <Grid item xs={12} md={6} key={loan.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Préstamo #{loan.id}
                      </Typography>
                      <Chip
                        label={loan.status}
                        color={getStatusColor(loan.status)}
                        size="small"
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      Ver Detalle
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Monto
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ${Number(loan.amount).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cuotas
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {loan.number_of_installments}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cuotas Pagadas
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        {loan.paid_installments || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo Pendiente
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="error.main">
                        ${Number(loan.remaining_amount || loan.total_amount || loan.amount).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Solicitud
                      </Typography>
                      <Typography variant="body1">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
