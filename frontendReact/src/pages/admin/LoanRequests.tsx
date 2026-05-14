import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { 
  Visibility, 
  CheckCircle, 
  Cancel, 
  Upload, 
  Person, 
  Email, 
  AttachMoney, 
  CalendarToday, 
  Description, 
  Download,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { loanService } from '@/services/loan.service';
import { Loan, LoanStatus, DepositInfo } from '@/models/loan.model';
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

export const LoanRequests: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [depositFile, setDepositFile] = useState<File | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositInfo>();

  useEffect(() => {
    loadLoans();
  }, [statusFilter]);

  const loadLoans = async () => {
    try {
      const params = statusFilter ? { status_filter: statusFilter } : {};
      const data = await loanService.getAll(params);
      console.log('📊 Préstamos cargados:', data);
      console.log('👤 Primer préstamo - Usuario:', data[0]?.user);
      setLoans(data);
    } catch (error) {
      showSnackbar('Error al cargar solicitudes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setOpenDialog(true);
  };

  const handleApprove = async (loan: Loan) => {
    setSelectedLoan(loan);
    reset({
      deposit_date: new Date().toISOString().split('T')[0],
      deposit_details: '',
    });
    setOpenDepositDialog(true);
  };

  const handleReject = async (loanId: number) => {
    if (window.confirm('¿Estás seguro de rechazar esta solicitud?')) {
      try {
        await loanService.updateStatus(loanId, {
          status: LoanStatus.TERMINADO,
          admin_notes: 'Solicitud rechazada',
        });
        showSnackbar('Solicitud rechazada', 'success');
        loadLoans();
      } catch (error) {
        showSnackbar('Error al rechazar solicitud', 'error');
      }
    }
  };

  const handleCopyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    showSnackbar('Número de cuenta copiado al portapapeles', 'success');
  };

  const onSubmitDeposit = async (data: DepositInfo) => {
    if (!selectedLoan) return;

    try {
      await loanService.registerDeposit(selectedLoan.id, data, depositFile || undefined);
      showSnackbar('Depósito registrado exitosamente', 'success');
      setOpenDepositDialog(false);
      setDepositFile(null);
      loadLoans();
    } catch (error) {
      showSnackbar('Error al registrar depósito', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestión de Solicitudes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las solicitudes de préstamo
          </Typography>
        </Box>
        <TextField
          select
          label="Filtrar por Estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="SOLICITADO">Solicitado</MenuItem>
          <MenuItem value="DEPOSITADO">Depositado</MenuItem>
          <MenuItem value="TERMINADO">Terminado</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Cuotas</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.id}</TableCell>
                <TableCell>
                  {loan.user ? `${loan.user.first_name} ${loan.user.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>${Number(loan.amount).toLocaleString()}</TableCell>
                <TableCell>{loan.number_of_installments}</TableCell>
                <TableCell>
                  <Chip label={loan.status} color={getStatusColor(loan.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleViewLoan(loan)}>
                    <Visibility />
                  </IconButton>
                  {loan.status === LoanStatus.SOLICITADO && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(loan)}
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(loan.id)}
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Description />
            <Typography variant="h6">Detalle de Solicitud #{selectedLoan?.id}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedLoan && (
            <Box>
              {/* Sección de Usuario */}
              <Card elevation={0} sx={{ borderRadius: 0 }}>
                <CardContent sx={{ bgcolor: 'grey.50' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <Person fontSize="large" />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedLoan.user
                          ? `${selectedLoan.user.first_name} ${selectedLoan.user.last_name}`
                          : 'Usuario no disponible'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" mb={0.5}>
                        <Email fontSize="small" />
                        <Typography variant="body2">
                          {selectedLoan.user?.email || 'Email no disponible'}
                        </Typography>
                      </Box>
                      {selectedLoan.user?.rut && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip 
                            label={`RUT: ${selectedLoan.user.rut}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Divider />

              {/* Información del Préstamo */}
              <Box p={3}>
                <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                  Información del Préstamo
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AttachMoney color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Monto Solicitado
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      ${Number(selectedLoan.amount).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarToday color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Número de Cuotas
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedLoan.number_of_installments} cuotas
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Fecha de Inicio de Pago
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedLoan.payment_start_date).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Fecha de Solicitud
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedLoan.created_at).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Comentarios
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1">
                        {selectedLoan.comment || 'Sin comentarios'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Cuenta Bancaria para Transferencia */}
              {selectedLoan.bank_account && (
                <Box p={3} sx={{ bgcolor: 'success.lighter' }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="success.dark">
                    💳 Cuenta Bancaria para Transferencia
                  </Typography>
                  <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Banco
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedLoan.bank_account.bank_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Tipo de Cuenta
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedLoan.bank_account.account_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Número de Cuenta
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight={600} color="primary.main">
                            {selectedLoan.bank_account.account_number}
                          </Typography>
                          <Chip 
                            label="Copiar" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            onClick={() => handleCopyAccountNumber(selectedLoan.bank_account!.account_number)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Titular
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedLoan.bank_account.holder_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          RUT del Titular
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedLoan.bank_account.holder_document_id}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Archivos Adjuntos */}
              {selectedLoan.files && selectedLoan.files.length > 0 && (
                <Box>
                  <Divider />
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                      Archivos Adjuntos ({selectedLoan.files.length})
                    </Typography>
                    <List>
                      {selectedLoan.files.map((file) => {
                        const isPdf = file.original_name?.toLowerCase().endsWith('.pdf');
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.original_name || '');
                        
                        return (
                          <ListItem
                            key={file.id}
                            disablePadding
                            sx={{ mb: 1 }}
                          >
                            <ListItemButton
                              onClick={() => {
                                const fileUrl = `http://localhost:8000${file.path || file.filepath}`;
                                window.open(fileUrl, '_blank');
                              }}
                              sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'primary.lighter',
                                  borderColor: 'primary.main',
                                }
                              }}
                            >
                              <ListItemIcon>
                                {isPdf ? (
                                  <PictureAsPdf color="error" />
                                ) : isImage ? (
                                  <ImageIcon color="primary" />
                                ) : (
                                  <InsertDriveFile color="action" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={file.original_name || file.filename || `Archivo ${file.id}`}
                                secondary={`Subido el ${new Date(file.uploaded_at).toLocaleDateString('es-CL')}`}
                              />
                              <Download color="action" />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDepositDialog}
        onClose={() => setOpenDepositDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registrar Depósito</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitDeposit)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Fecha de Depósito"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('deposit_date', { required: 'Campo requerido' })}
              error={!!errors.deposit_date}
              helperText={errors.deposit_date?.message}
            />
            <TextField
              fullWidth
              label="Detalles del Depósito"
              multiline
              rows={3}
              margin="normal"
              {...register('deposit_details', { required: 'Campo requerido' })}
              error={!!errors.deposit_details}
              helperText={errors.deposit_details?.message}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ mt: 2 }}
            >
              {depositFile ? depositFile.name : 'Subir Comprobante'}
              <input
                type="file"
                hidden
                accept="application/pdf,image/*"
                onChange={(e) => setDepositFile(e.target.files?.[0] || null)}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDepositDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Registrar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
