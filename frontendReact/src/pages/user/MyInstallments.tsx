import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { CheckCircle, Schedule, Error as ErrorIcon } from '@mui/icons-material';
import { loanService } from '@/services/loan.service';
import { installmentService } from '@/services/installment.service';
import { Loan } from '@/models/loan.model';
import { Installment } from '@/models/installment.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const MyInstallments: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installmentsByLoan, setInstallmentsByLoan] = useState<Record<number, Installment[]>>({});
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar préstamos depositados
      const allLoans = await loanService.getAll({ status_filter: 'DEPOSITADO' });
      setLoans(allLoans);

      // Cargar cuotas de cada préstamo
      const installmentsMap: Record<number, Installment[]> = {};
      for (const loan of allLoans) {
        const installments = await installmentService.getByLoan(loan.id);
        installmentsMap[loan.id] = installments;
      }
      setInstallmentsByLoan(installmentsMap);
    } catch (error) {
      showSnackbar('Error al cargar cuotas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const calculateProgress = (installments: Installment[]) => {
    if (!installments.length) return 0;
    const paid = installments.filter((i) => i.is_paid).length;
    return (paid / installments.length) * 100;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mis Cuotas
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Detalle de todas las cuotas de tus préstamos
      </Typography>

      {loans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No tienes préstamos activos
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {loans.map((loan) => {
            const installments = installmentsByLoan[loan.id] || [];
            const progress = calculateProgress(installments);
            const paidCount = installments.filter((i) => i.is_paid).length;
            const overdueCount = installments.filter((i) => !i.is_paid && isOverdue(i.due_date)).length;

            return (
              <Grid item xs={12} key={loan.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Préstamo #{loan.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monto: ${Number(loan.amount).toLocaleString()} | 
                          Total cuotas: {loan.number_of_installments}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="primary">
                          {paidCount}/{installments.length}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          {progress.toFixed(0)}% completado
                        </Typography>
                        {overdueCount > 0 && (
                          <Chip 
                            label={`${overdueCount} vencida${overdueCount > 1 ? 's' : ''}`} 
                            color="error" 
                            size="small" 
                          />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Cuota</TableCell>
                            <TableCell>Monto</TableCell>
                            <TableCell>Vencimiento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Pagado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {installments.map((installment) => {
                            const overdue = isOverdue(installment.due_date);

                            return (
                              <TableRow
                                key={installment.id}
                                sx={{
                                  bgcolor: overdue && !installment.is_paid ? 'error.lighter' : 'inherit',
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    {installment.is_paid ? (
                                      <CheckCircle color="success" fontSize="small" />
                                    ) : overdue ? (
                                      <ErrorIcon color="error" fontSize="small" />
                                    ) : (
                                      <Schedule color="action" fontSize="small" />
                                    )}
                                    Cuota #{installment.installment_number}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  ${Number(installment.amount).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {installment.due_date
                                    ? new Date(installment.due_date).toLocaleDateString('es-CL', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                      })
                                    : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {installment.is_paid ? (
                                    <Chip label="Pagada" color="success" size="small" />
                                  ) : overdue ? (
                                    <Chip label="Vencida" color="error" size="small" />
                                  ) : (
                                    <Chip label="Pendiente" color="warning" size="small" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {installment.paid_at
                                    ? new Date(installment.paid_at).toLocaleDateString('es-CL')
                                    : '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
