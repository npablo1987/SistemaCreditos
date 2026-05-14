import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { loanService } from '@/services/loan.service';
import { installmentService } from '@/services/installment.service';
import { Loan, LoanStatus } from '@/models/loan.model';
import { Installment } from '@/models/installment.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
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

export const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    if (id) {
      loadLoanDetail();
    }
  }, [id]);

  const loadLoanDetail = async () => {
    try {
      const loanData = await loanService.getById(Number(id));
      setLoan(loanData);

      const installmentsData = await installmentService.getByLoan(Number(id));
      setInstallments(installmentsData);
    } catch (error) {
      showSnackbar('Error al cargar detalle del préstamo', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!loan) return <Typography>Préstamo no encontrado</Typography>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Detalle del Préstamo #{loan.id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Información General</Typography>
                <Chip label={loan.status} color={getStatusColor(loan.status)} />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Monto Solicitado
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ${Number(loan.amount).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total a Pagar
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ${loan.total_amount ? Number(loan.total_amount).toLocaleString() : 'Pendiente'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número de Cuotas
                  </Typography>
                  <Typography variant="body1">{loan.number_of_installments}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor por Cuota
                  </Typography>
                  <Typography variant="body1">
                    ${loan.installment_amount ? Number(loan.installment_amount).toLocaleString() : 'Pendiente'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Interés
                  </Typography>
                  <Typography variant="body1">
                    {loan.interest_rate ? (loan.interest_rate * 100).toFixed(1) : '5.0'}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Inicio
                  </Typography>
                  <Typography variant="body1">
                    {new Date(loan.payment_start_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              {loan.comment && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Comentarios
                  </Typography>
                  <Typography variant="body1">{loan.comment}</Typography>
                </>
              )}

              {loan.admin_observations && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Notas del Administrador
                  </Typography>
                  <Typography variant="body1">{loan.admin_observations}</Typography>
                </>
              )}

              {loan.deposit_details && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Detalles del Depósito
                  </Typography>
                  <Typography variant="body1">{loan.deposit_details}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Fecha de Depósito: {loan.deposit_date ? new Date(loan.deposit_date).toLocaleDateString() : 'N/A'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Pagos
              </Typography>
              {installments.length === 0 ? (
                <Typography color="text.secondary">
                  No hay cuotas pagadas aún
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Cuota #</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Fecha de Pago</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {installments.map((inst) => (
                        <TableRow key={inst.id}>
                          <TableCell>{inst.installment_number}</TableCell>
                          <TableCell>${inst.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(inst.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <CheckCircle color="success" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Cuotas Pagadas:</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {loan.paid_installments || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Cuotas Pendientes:</Typography>
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  {loan.number_of_installments - (loan.paid_installments || 0)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Saldo Pendiente:</Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  ${Number(loan.remaining_amount || loan.total_amount || loan.amount).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {loan.bank_account && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cuenta Bancaria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Banco
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {loan.bank_account.bank_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Número de Cuenta
                </Typography>
                <Typography variant="body1">
                  {loan.bank_account.account_number}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
