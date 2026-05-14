import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add, Upload } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { loanService } from '@/services/loan.service';
import { installmentService } from '@/services/installment.service';
import { Loan, LoanStatus } from '@/models/loan.model';
import { InstallmentCreate } from '@/models/installment.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const InstallmentManagement: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstallmentCreate>();

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await loanService.getAll({ status_filter: LoanStatus.DEPOSITADO });
      setLoans(data);
    } catch (error) {
      showSnackbar('Error al cargar préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    const nextInstallment = (loan.paid_installments || 0) + 1;
    reset({
      installment_number: nextInstallment,
      amount: loan.installment_amount,
      payment_date: new Date().toISOString().split('T')[0],
      observation: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLoan(null);
    setReceiptFile(null);
    reset();
  };

  const onSubmit = async (data: InstallmentCreate) => {
    if (!selectedLoan) return;

    try {
      await installmentService.create(selectedLoan.id, data, receiptFile || undefined);
      showSnackbar('Cuota registrada exitosamente', 'success');
      handleCloseDialog();
      loadLoans();
    } catch (error) {
      showSnackbar('Error al registrar cuota', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Gestión de Cuotas
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Registra los pagos de cuotas de los préstamos activos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Monto Total</TableCell>
              <TableCell>Valor Cuota</TableCell>
              <TableCell>Cuotas Pagadas</TableCell>
              <TableCell>Cuotas Restantes</TableCell>
              <TableCell>Saldo Pendiente</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => {
              const paidInstallments = loan.paid_installments || 0;
              const remainingInstallments = loan.number_of_installments - paidInstallments;
              const remainingAmount = loan.remaining_amount || loan.total_amount || loan.amount;

              return (
                <TableRow key={loan.id}>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>
                    {loan.user ? `${loan.user.first_name} ${loan.user.last_name}` : 'N/A'}
                  </TableCell>
                  <TableCell>${loan.total_amount ? Number(loan.total_amount).toLocaleString() : Number(loan.amount).toLocaleString()}</TableCell>
                  <TableCell>${loan.installment_amount ? Number(loan.installment_amount).toLocaleString() : 'Pendiente'}</TableCell>
                  <TableCell>{paidInstallments}</TableCell>
                  <TableCell>{remainingInstallments}</TableCell>
                  <TableCell>${Number(remainingAmount).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(loan)}
                      disabled={remainingInstallments === 0}
                    >
                      <Add />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Pago de Cuota</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {selectedLoan && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Préstamo #{selectedLoan.id} -{' '}
                  {selectedLoan.user
                    ? `${selectedLoan.user.first_name} ${selectedLoan.user.last_name}`
                    : 'N/A'}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Número de Cuota"
              type="number"
              margin="normal"
              {...register('installment_number', { required: 'Campo requerido' })}
              error={!!errors.installment_number}
              helperText={errors.installment_number?.message}
              InputProps={{ readOnly: true }}
            />

            <TextField
              fullWidth
              label="Monto"
              type="number"
              margin="normal"
              {...register('amount', { required: 'Campo requerido' })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />

            <TextField
              fullWidth
              label="Fecha de Pago"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('payment_date', { required: 'Campo requerido' })}
              error={!!errors.payment_date}
              helperText={errors.payment_date?.message}
            />

            <TextField
              fullWidth
              label="Observaciones (Opcional)"
              multiline
              rows={2}
              margin="normal"
              {...register('observation')}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ mt: 2 }}
            >
              {receiptFile ? receiptFile.name : 'Subir Comprobante (Opcional)'}
              <input
                type="file"
                hidden
                accept="application/pdf,image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Registrar Pago
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
