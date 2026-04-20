import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { PatientList, PatientRegistration, PatientDetail } from '@/pages/Patients';
import { BillList, CreateBill, BillDetail } from '@/pages/Billing';
import { DailySummary, RevenueReport } from '@/pages/Reports';
import UserList from '@/pages/Users/UserList';

function ProtectedRoute({ requireAdmin }: { requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout><Login /></AuthLayout>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/register" element={<PatientRegistration />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/edit" element={<PatientRegistration />} />
          <Route path="/billing" element={<BillList />} />
          <Route path="/billing/create" element={<CreateBill />} />
          <Route path="/billing/:id" element={<BillDetail />} />
          <Route path="/reports" element={<DailySummary />} />
          <Route path="/reports/daily" element={<DailySummary />} />
          <Route path="/reports/revenue" element={<RevenueReport />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<DashboardLayout />}>
            <Route path="/users" element={<UserList />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}