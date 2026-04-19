import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { PatientList, PatientRegistration, PatientDetail } from '@/pages/Patients';
import { BillList, CreateBill, BillDetail } from '@/pages/Billing';
import { DailySummary, RevenueReport } from '@/pages/Reports';
import UserList from '@/pages/Users/UserList';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  return <>{children}</>;
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
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PatientList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patients/register"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PatientRegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PatientDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patients/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PatientRegistration />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/billing/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateBill />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/billing/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DailySummary />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/daily"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DailySummary />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/revenue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RevenueReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout>
              <UserList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}