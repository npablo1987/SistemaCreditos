import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, AccountBalance } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { bankAccountService } from '@/services/bank-account.service';
import { BankAccount, BankAccountCreate } from '@/models/bank-account.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSnackbarStore } from '@/store/notification.store';
import { CHILEAN_BANKS, ACCOUNT_TYPES } from '@/constants/banks';

export const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountCreate>();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await bankAccountService.getAll();
      setAccounts(data);
    } catch (error) {
      showSnackbar('Error al cargar cuentas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
      reset(account);
    } else {
      setEditingAccount(null);
      reset({
        bank_name: '',
        account_type: '',
        account_number: '',
        holder_name: '',
        holder_document_id: '',
        is_primary: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
    reset();
  };

  const onSubmit = async (data: BankAccountCreate) => {
    try {
      if (editingAccount) {
        await bankAccountService.update(editingAccount.id, data);
        showSnackbar('Cuenta actualizada exitosamente', 'success');
      } else {
        await bankAccountService.create(data);
        showSnackbar('Cuenta creada exitosamente', 'success');
      }
      loadAccounts();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error al guardar cuenta', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta cuenta?')) {
      try {
        await bankAccountService.delete(id);
        showSnackbar('Cuenta eliminada exitosamente', 'success');
        loadAccounts();
      } catch (error) {
        showSnackbar('Error al eliminar cuenta', 'error');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Cuentas Bancarias
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra tus cuentas bancarias
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Cuenta
        </Button>
      </Box>

      {accounts.length === 0 ? (
        <EmptyState
          message="No tienes cuentas bancarias registradas"
          icon={<AccountBalance sx={{ fontSize: 64, color: 'text.secondary' }} />}
        />
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} key={account.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {account.bank_name}
                      </Typography>
                      {account.is_primary && (
                        <Chip label="Principal" color="primary" size="small" sx={{ mb: 1 }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Tipo: {account.account_type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Número: {account.account_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Titular: {account.holder_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RUT: {account.holder_document_id}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(account)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Banco"
              margin="normal"
              {...register('bank_name', { required: 'Campo requerido' })}
              error={!!errors.bank_name}
              helperText={errors.bank_name?.message}
            >
              {CHILEAN_BANKS.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Tipo de Cuenta"
              margin="normal"
              {...register('account_type', { required: 'Campo requerido' })}
              error={!!errors.account_type}
              helperText={errors.account_type?.message}
            >
              {ACCOUNT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Número de Cuenta"
              margin="normal"
              {...register('account_number', { required: 'Campo requerido' })}
              error={!!errors.account_number}
              helperText={errors.account_number?.message}
            />
            <TextField
              fullWidth
              label="Titular"
              margin="normal"
              {...register('holder_name', { required: 'Campo requerido' })}
              error={!!errors.holder_name}
              helperText={errors.holder_name?.message}
            />
            <TextField
              fullWidth
              label="RUT Titular"
              margin="normal"
              {...register('holder_document_id', { required: 'Campo requerido' })}
              error={!!errors.holder_document_id}
              helperText={errors.holder_document_id?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
