import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Lock } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { UserUpdate, ChangePassword } from '@/models/user.model';
import { useSnackbarStore } from '@/store/notification.store';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { showSnackbar } = useSnackbarStore();
  const [editMode, setEditMode] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserUpdate>({
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      phone: user?.phone,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePassword>();

  const onSubmitProfile = async (data: UserUpdate) => {
    try {
      if (user) {
        const updatedUser = await userService.update(user.id, data);
        setUser(updatedUser);
        showSnackbar('Perfil actualizado exitosamente', 'success');
        setEditMode(false);
      }
    } catch (error) {
      showSnackbar('Error al actualizar perfil', 'error');
    }
  };

  const onSubmitPassword = async (data: ChangePassword) => {
    try {
      await userService.changePassword(data);
      showSnackbar('Contraseña actualizada exitosamente', 'success');
      setOpenPasswordDialog(false);
      resetPassword();
    } catch (error) {
      showSnackbar('Error al cambiar contraseña', 'error');
    }
  };

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mi Perfil
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Administra tu información personal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Información Personal</Typography>
                {!editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar
                  </Button>
                )}
              </Box>

              <form onSubmit={handleSubmit(onSubmitProfile)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      {...register('first_name', { required: 'Campo requerido' })}
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      {...register('last_name', { required: 'Campo requerido' })}
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      {...register('email', { required: 'Campo requerido' })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      {...register('phone', { required: 'Campo requerido' })}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={!editMode}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      variant="contained"
                      type="submit"
                    >
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de Cuenta
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Usuario
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {user.username}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  RUT
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {user.document_id}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Rol
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {user.role}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Lock />}
                onClick={() => setOpenPasswordDialog(true)}
              >
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Contraseña Actual"
              type="password"
              margin="normal"
              {...registerPassword('current_password', { required: 'Campo requerido' })}
              error={!!passwordErrors.current_password}
              helperText={passwordErrors.current_password?.message}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              margin="normal"
              {...registerPassword('new_password', {
                required: 'Campo requerido',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              error={!!passwordErrors.new_password}
              helperText={passwordErrors.new_password?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Cambiar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
