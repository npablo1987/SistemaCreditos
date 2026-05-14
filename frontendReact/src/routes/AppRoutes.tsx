import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/guards/AuthGuard';
import { RoleGuard } from '@/guards/RoleGuard';
import { MainLayout } from '@/layouts/MainLayout';
import { Login } from '@/pages/auth/Login';
import { UserDashboard } from '@/pages/user/Dashboard';
import { Profile } from '@/pages/user/Profile';
import { BankAccounts } from '@/pages/user/BankAccounts';
import { LoanRequest } from '@/pages/user/LoanRequest';
import { MyLoans } from '@/pages/user/MyLoans';
import { LoanDetail } from '@/pages/user/LoanDetail';
import { MyInstallments } from '@/pages/user/MyInstallments';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { LoanRequests } from '@/pages/admin/LoanRequests';
import { InstallmentManagement } from '@/pages/admin/InstallmentManagement';
import { Reports } from '@/pages/admin/Reports';
import { LoanSettingsPage } from '@/pages/admin/LoanSettings';
import { MonthlyPayments } from '@/pages/admin/MonthlyPayments';
import { UserRole } from '@/models/user.model';
import { useAuthStore } from '@/store/auth.store';

const DashboardRedirect = () => {
  const user = useAuthStore((state) => state.user);
  
  if (user?.role === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/user/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardRedirect />} />
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route path="profile" element={<Profile />} />
          
          <Route
            path="user/dashboard"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <UserDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="bank-accounts"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <BankAccounts />
              </RoleGuard>
            }
          />
          <Route
            path="loans/request"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <LoanRequest />
              </RoleGuard>
            }
          />
          <Route
            path="loans"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <MyLoans />
              </RoleGuard>
            }
          />
          <Route
            path="loans/:id"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <LoanDetail />
              </RoleGuard>
            }
          />
          <Route
            path="installments"
            element={
              <RoleGuard allowedRoles={[UserRole.USER]}>
                <MyInstallments />
              </RoleGuard>
            }
          />
          
          <Route
            path="admin/dashboard"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="admin/users"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/requests"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <LoanRequests />
              </RoleGuard>
            }
          />
          <Route
            path="admin/installments"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <InstallmentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/reports"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <Reports />
              </RoleGuard>
            }
          />
          <Route
            path="admin/settings"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <LoanSettingsPage />
              </RoleGuard>
            }
          />
          <Route
            path="admin/monthly-payments"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <MonthlyPayments />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
