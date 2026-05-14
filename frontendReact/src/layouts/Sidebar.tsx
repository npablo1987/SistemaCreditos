import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Badge,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/models/user.model';
import { loanService } from '@/services/loan.service';
import { LoanStatus } from '@/models/loan.model';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: [UserRole.USER, UserRole.ADMIN],
  },
  {
    text: 'Mi Perfil',
    icon: <PersonIcon />,
    path: '/profile',
    roles: [UserRole.USER, UserRole.ADMIN],
  },
  {
    text: 'Cuentas Bancarias',
    icon: <AccountBalanceIcon />,
    path: '/bank-accounts',
    roles: [UserRole.USER],
  },
  {
    text: 'Solicitar Préstamo',
    icon: <RequestQuoteIcon />,
    path: '/loans/request',
    roles: [UserRole.USER],
  },
  {
    text: 'Mis Préstamos',
    icon: <AccountBalanceWalletIcon />,
    path: '/loans',
    roles: [UserRole.USER],
  },
  {
    text: 'Mis Cuotas',
    icon: <PaymentIcon />,
    path: '/installments',
    roles: [UserRole.USER],
  },
  {
    text: 'Usuarios',
    icon: <PeopleIcon />,
    path: '/admin/users',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Solicitudes',
    icon: <PendingActionsIcon />,
    path: '/admin/requests',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Gestión de Cuotas',
    icon: <PaymentIcon />,
    path: '/admin/installments',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Pagos Mensuales',
    icon: <CalendarMonthIcon />,
    path: '/admin/monthly-payments',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Reportes',
    icon: <AssessmentIcon />,
    path: '/admin/reports',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Configuración',
    icon: <SettingsIcon />,
    path: '/admin/settings',
    roles: [UserRole.ADMIN],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  drawerWidth, 
  mobileOpen, 
  onDrawerToggle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadPendingCount();
      const interval = setInterval(loadPendingCount, 30000); // Actualizar cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingCount = async () => {
    try {
      const loans = await loanService.getAll();
      const pending = loans.filter(l => l.status === LoanStatus.SOLICITADO).length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error loading pending count', error);
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Sistema Créditos
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) onDrawerToggle();
              }}
            >
              <ListItemIcon>
                {item.path === '/admin/requests' && pendingCount > 0 ? (
                  <Badge badgeContent={pendingCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
