export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant';
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  patient?: Patient;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  items: BillItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DailySummary {
  date: string;
  totalPatients: number;
  newPatients: number;
  totalBills: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  averageBillAmount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: User['role'];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient?: Patient;
  visitNumber: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface OfflineRecord<T> {
  id: string;
  data: T;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}