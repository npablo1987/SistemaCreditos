import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Save, Settings } from '@mui/icons-material';
import { settingsService } from '@/services/settings.service';
import { LoanSettings, LoanSettingsUpdate } from '@/models/settings.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const LoanSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<LoanSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanSettingsUpdate>();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getLoanSettings();
      setSettings(data);
      reset(data);
    } catch (error) {
      showSnackbar('Error al cargar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoanSettingsUpdate) => {
    setSaving(true);
    try {
      const updated = await settingsService.updateLoanSettings(data);
      setSettings(updated);
      showSnackbar('Configuración actualizada correctamente', 'success');
    } catch (error) {
      showSnackbar('Error al actualizar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Settings sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Configuración de Préstamos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configura los límites y tasas para las solicitudes de préstamos
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  💰 Límites de Monto
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monto Mínimo"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  {...register('min_amount', {
                    required: 'Campo requerido',
                    min: { value: 1, message: 'Debe ser mayor a 0' },
                  })}
                  error={!!errors.min_amount}
                  helperText={errors.min_amount?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monto Máximo"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  {...register('max_amount', {
                    required: 'Campo requerido',
                    min: { value: 1, message: 'Debe ser mayor a 0' },
                  })}
                  error={!!errors.max_amount}
                  helperText={errors.max_amount?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  📅 Límites de Cuotas
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número Mínimo de Cuotas"
                  type="number"
                  {...register('min_installments', {
                    required: 'Campo requerido',
                    min: { value: 1, message: 'Debe ser al menos 1' },
                  })}
                  error={!!errors.min_installments}
                  helperText={errors.min_installments?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número Máximo de Cuotas"
                  type="number"
                  {...register('max_installments', {
                    required: 'Campo requerido',
                    min: { value: 1, message: 'Debe ser al menos 1' },
                  })}
                  error={!!errors.max_installments}
                  helperText={errors.max_installments?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  📊 Tasa de Interés
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tasa de Interés"
                  type="number"
                  inputProps={{
                    step: '0.01',
                    min: '0',
                    max: '1',
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  {...register('interest_rate', {
                    required: 'Campo requerido',
                    min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                    max: { value: 1, message: 'Debe ser menor o igual a 100%' },
                  })}
                  error={!!errors.interest_rate}
                  helperText={
                    errors.interest_rate?.message ||
                    'Ingresa el valor decimal (ej: 0.05 para 5%)'
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => reset(settings || undefined)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </Box>
              </Grid>

              {settings && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Última actualización:</strong>{' '}
                      {settings.updated_at
                        ? new Date(settings.updated_at).toLocaleString()
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
