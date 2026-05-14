import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { loanService } from '@/services/loan.service';
import { bankAccountService } from '@/services/bank-account.service';
import { settingsService } from '@/services/settings.service';
import { LoanCreate, LoanSimulation } from '@/models/loan.model';
import { BankAccount } from '@/models/bank-account.model';
import { LoanSettings } from '@/models/settings.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const LoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null);
  const [settings, setSettings] = useState<LoanSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoanCreate>();

  const amount = watch('amount');
  const number_of_installments = watch('number_of_installments');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (amount && number_of_installments) {
      simulateLoan();
    }
  }, [amount, number_of_installments]);

  const loadAccounts = async () => {
    try {
      const [accountsData, settingsData] = await Promise.all([
        bankAccountService.getAll(),
        settingsService.getLoanSettings(),
      ]);
      setAccounts(accountsData);
      setSettings(settingsData);
    } catch (error) {
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateLoan = async () => {
    try {
      const sim = await loanService.simulate(Number(amount), Number(number_of_installments));
      setSimulation(sim);
    } catch (error) {
      console.error('Error en simulación', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: LoanCreate) => {
    if (accounts.length === 0) {
      showSnackbar('Debes tener al menos una cuenta bancaria', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await loanService.create(data, files);
      showSnackbar('Solicitud de préstamo creada exitosamente', 'success');
      navigate('/loans');
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.detail || 'Error al crear solicitud',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Solicitar Préstamo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Completa el formulario para solicitar un préstamo
      </Typography>

      {settings && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Límites de solicitud:</strong>
          <br />
          Monto: ${settings.min_amount.toLocaleString()} - ${settings.max_amount.toLocaleString()}
          <br />
          Cuotas: {settings.min_installments} - {settings.max_installments}
          <br />
          Tasa de interés: {(settings.interest_rate * 100).toFixed(1)}%
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información del Préstamo
                </Typography>

                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  margin="normal"
                  {...register('amount', {
                    required: 'Campo requerido',
                    min: { 
                      value: settings?.min_amount || 1, 
                      message: `Monto mínimo: $${settings?.min_amount.toLocaleString() || 1}` 
                    },
                    max: { 
                      value: settings?.max_amount || 999999999, 
                      message: `Monto máximo: $${settings?.max_amount.toLocaleString() || 999999999}` 
                    },
                  })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message || `Rango: $${settings?.min_amount.toLocaleString()} - $${settings?.max_amount.toLocaleString()}`}
                />

                <TextField
                  fullWidth
                  label="Número de Cuotas"
                  type="number"
                  margin="normal"
                  {...register('number_of_installments', {
                    required: 'Campo requerido',
                    min: { 
                      value: settings?.min_installments || 1, 
                      message: `Mínimo ${settings?.min_installments || 1} cuotas` 
                    },
                    max: { 
                      value: settings?.max_installments || 999, 
                      message: `Máximo ${settings?.max_installments || 999} cuotas` 
                    },
                  })}
                  error={!!errors.number_of_installments}
                  helperText={errors.number_of_installments?.message || `Rango: ${settings?.min_installments} - ${settings?.max_installments} cuotas`}
                />

                <TextField
                  fullWidth
                  label="Fecha de Inicio de Pago"
                  type="date"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  {...register('payment_start_date', { required: 'Campo requerido' })}
                  error={!!errors.payment_start_date}
                  helperText={errors.payment_start_date?.message}
                />

                <TextField
                  fullWidth
                  select
                  label="Cuenta Bancaria"
                  margin="normal"
                  {...register('bank_account_id', { required: 'Campo requerido' })}
                  error={!!errors.bank_account_id}
                  helperText={errors.bank_account_id?.message}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_number}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Comentarios (Opcional)"
                  multiline
                  rows={3}
                  margin="normal"
                  {...register('comments')}
                />

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Archivos Adjuntos
                  </Typography>
                  <Paper
                    {...getRootProps()}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'grey.300',
                      backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1">
                      {isDragActive
                        ? 'Suelta los archivos aquí'
                        : 'Arrastra archivos o haz clic para seleccionar'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF, PNG, JPG (máx. 10MB)
                    </Typography>
                  </Paper>

                  {files.length > 0 && (
                    <List sx={{ mt: 2 }}>
                      {files.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => removeFile(index)}>
                              <Delete />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Simulación
                </Typography>
                {simulation ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Monto Solicitado:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${simulation.amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Tasa de Interés:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(simulation.interest_rate * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Interés Total:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${simulation.total_interest.toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Valor Cuota:</Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ${simulation.installment_amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total a Pagar:</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        ${simulation.total_amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Ingresa monto y cuotas para simular
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              disabled={submitting || !simulation}
            >
              {submitting ? 'Enviando...' : 'Solicitar Préstamo'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
