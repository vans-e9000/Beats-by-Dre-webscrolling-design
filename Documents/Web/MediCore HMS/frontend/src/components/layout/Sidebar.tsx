import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import { slideIn } from '@/utils/motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/billing', label: 'Billing', icon: CreditCard },
  { path: '/reports', label: 'Reports', icon: FileText },
];

const adminMenuItems = [
  { path: '/users', label: 'Users', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-secondary-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600">MediCore HMS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div key={item.path} variants={slideIn} custom={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 border-l-2',
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-100 border-transparent'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2 border-t border-secondary-200">
              <span className="px-3 text-xs font-medium text-secondary-400 uppercase">
                Admin
              </span>
            </div>
            {adminMenuItems.map((item, index) => (
              <motion.div key={item.path} variants={slideIn} custom={index + menuItems.length}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 border-l-2',
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-primary-600'
                        : 'text-secondary-600 hover:bg-secondary-100 border-transparent'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-800 truncate">{user?.name}</p>
            <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full flex items-center gap-3 px-3 py-2 text-secondary-600 hover:bg-secondary-100 rounded-md transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
