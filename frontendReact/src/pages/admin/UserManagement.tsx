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
  Chip,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/user.service';
import { User, UserCreate, UserRole } from '@/models/user.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreate>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      showSnackbar('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        document_id: user.document_id,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      reset({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        document_id: '',
        role: UserRole.USER,
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: UserCreate) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });
        showSnackbar('Usuario actualizado exitosamente', 'success');
      } else {
        await userService.create(data);
        showSnackbar('Usuario creado exitosamente', 'success');
      }
      loadUsers();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error al guardar usuario', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userService.delete(id);
        showSnackbar('Usuario eliminado exitosamente', 'success');
        loadUsers();
      } catch (error) {
        showSnackbar('Error al eliminar usuario', 'error');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>RUT</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.document_id}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === UserRole.ADMIN ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Activo' : 'Inactivo'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              margin="normal"
              {...register('first_name', { required: 'Campo requerido' })}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
            <TextField
              fullWidth
              label="Apellido"
              margin="normal"
              {...register('last_name', { required: 'Campo requerido' })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', { required: 'Campo requerido' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Usuario"
              margin="normal"
              {...register('username', { required: 'Campo requerido' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={!!editingUser}
            />
            {!editingUser && (
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                margin="normal"
                {...register('password', { required: 'Campo requerido' })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
            <TextField
              fullWidth
              label="Teléfono"
              margin="normal"
              {...register('phone', { required: 'Campo requerido' })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
            <TextField
              fullWidth
              label="RUT"
              margin="normal"
              {...register('document_id', { required: 'Campo requerido' })}
              error={!!errors.document_id}
              helperText={errors.document_id?.message}
              disabled={!!editingUser}
            />
            {!editingUser && (
              <TextField
                fullWidth
                select
                label="Rol"
                margin="normal"
                defaultValue={UserRole.USER}
                {...register('role', { required: 'Campo requerido' })}
                error={!!errors.role}
                helperText={errors.role?.message}
              >
                <MenuItem value={UserRole.USER}>Usuario</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
