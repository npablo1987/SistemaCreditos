import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material';
import { CheckCircle, PictureAsPdf } from '@mui/icons-material';
import { installmentService } from '@/services/installment.service';
import { loanService } from '@/services/loan.service';
import { Installment } from '@/models/installment.model';
import { Loan } from '@/models/loan.model';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSnackbarStore } from '@/store/notification.store';

export const MonthlyPayments: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbarStore();

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return year.toString();
  });

  useEffect(() => {
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    setSelectedMonth(currentMonth);
  }, []);

  const loadInstallments = async () => {
    if (!selectedMonth || !selectedYear) {
      showSnackbar('Seleccione mes y año', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Cargar todos los préstamos depositados
      const allLoans = await loanService.getAll({ status_filter: 'DEPOSITADO' });
      setLoans(allLoans);

      // Cargar cuotas de cada préstamo
      const allInstallments: Installment[] = [];
      for (const loan of allLoans) {
        const loanInstallments = await installmentService.getByLoan(loan.id);
        // Filtrar por mes y año
        const filtered = loanInstallments.filter((inst) => {
          if (!inst.due_date) return false;
          const dueDate = new Date(inst.due_date);
          const month = (dueDate.getMonth() + 1).toString().padStart(2, '0');
          const year = dueDate.getFullYear().toString();
          return month === selectedMonth && year === selectedYear;
        });
        allInstallments.push(...filtered);
      }

      setInstallments(allInstallments);
    } catch (error) {
      showSnackbar('Error al cargar cuotas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (loanId: number, installmentId: number) => {
    try {
      await installmentService.markAsPaid(loanId, installmentId);
      showSnackbar('Cuota marcada como pagada', 'success');
      loadInstallments();
    } catch (error) {
      showSnackbar('Error al marcar cuota como pagada', 'error');
    }
  };

  const handleDownloadPDF = () => {
    const monthName = months.find((m) => m.value === selectedMonth)?.label || '';
    
    // Crear contenido HTML para el PDF
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Cuotas - ${monthName} ${selectedYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #1976d2;
            text-align: center;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #1976d2;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .overdue {
            background-color: #ffebee !important;
          }
          .paid {
            color: #4caf50;
            font-weight: bold;
          }
          .pending {
            color: #ff9800;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Reporte de Cuotas Mensuales</h1>
        <div class="subtitle">${monthName} ${selectedYear}</div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">Total Cuotas</div>
            <div class="stat-value">${installments.length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Pagadas</div>
            <div class="stat-value" style="color: #4caf50;">${installments.filter((i) => i.is_paid).length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value" style="color: #ff9800;">${installments.filter((i) => !i.is_paid).length}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Monto Total</div>
            <div class="stat-value">$${installments.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Préstamo</th>
              <th>Usuario</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Cuota #</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${installments.map((installment) => {
              const loan = getLoanForInstallment(installment);
              const overdue = isOverdue(installment.due_date);
              const rowClass = overdue && !installment.is_paid ? 'overdue' : '';
              
              return `
                <tr class="${rowClass}">
                  <td>#${loan?.id || 'N/A'}</td>
                  <td>${loan?.user ? `${loan.user.first_name} ${loan.user.last_name}` : 'N/A'}</td>
                  <td>${loan?.user?.rut || 'N/A'}</td>
                  <td>${loan?.user?.email || 'N/A'}</td>
                  <td>${installment.installment_number}</td>
                  <td>$${Number(installment.amount).toLocaleString()}</td>
                  <td>${installment.due_date ? new Date(installment.due_date).toLocaleDateString('es-CL') : 'N/A'}</td>
                  <td class="${installment.is_paid ? 'paid' : 'pending'}">
                    ${installment.is_paid ? 'Pagada' : overdue ? 'Vencida' : 'Pendiente'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}
        </div>
      </body>
      </html>
    `;
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Esperar a que se cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      showSnackbar('Abriendo vista de impresión...', 'success');
    } else {
      showSnackbar('Error: Permita las ventanas emergentes para descargar el PDF', 'error');
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getLoanForInstallment = (installment: Installment): Loan | undefined => {
    return loans.find((loan) => loan.id === installment.loan_id);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Pagos Mensuales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las cuotas que vencen en el mes seleccionado
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={handleDownloadPDF}
          disabled={installments.length === 0}
        >
          Descargar PDF
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Mes"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Año"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={loadInstallments}
              sx={{ height: 56 }}
            >
              Buscar Cuotas
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {installments.length > 0 && (
        <Paper>
          <Box p={2} bgcolor="primary.main" color="white">
            <Typography variant="h6">
              Cuotas de {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </Typography>
            <Typography variant="body2">
              Total: {installments.length} cuotas | 
              Pagadas: {installments.filter((i) => i.is_paid).length} | 
              Pendientes: {installments.filter((i) => !i.is_paid).length}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Préstamo</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>RUT</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Cuota #</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installments.map((installment) => {
                  const loan = getLoanForInstallment(installment);
                  const overdue = isOverdue(installment.due_date);

                  return (
                    <TableRow
                      key={installment.id}
                      sx={{
                        bgcolor: overdue && !installment.is_paid ? 'error.lighter' : 'inherit',
                      }}
                    >
                      <TableCell>#{loan?.id}</TableCell>
                      <TableCell>
                        {loan?.user
                          ? `${loan.user.first_name} ${loan.user.last_name}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{loan?.user?.rut || 'N/A'}</TableCell>
                      <TableCell>{loan?.user?.email || 'N/A'}</TableCell>
                      <TableCell>{installment.installment_number}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ${Number(installment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {installment.due_date
                          ? new Date(installment.due_date).toLocaleDateString('es-CL')
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
                      <TableCell align="center">
                        {!installment.is_paid && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleMarkAsPaid(installment.loan_id, installment.id)}
                            title="Marcar como pagada"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!loading && installments.length === 0 && selectedMonth && selectedYear && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay cuotas para el mes seleccionado
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
