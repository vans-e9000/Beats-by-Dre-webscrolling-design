export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant' | 'lab_technician';
  isActive?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  visitId: string;
  patient?: Patient;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'draft';
  dueDate?: string;
  notes?: string;
  items: BillItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface BillItem {
  id: string;
  billId: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  [key: string]: unknown;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance';
  referenceNumber?: string;
  paidAt: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination: PaginationInfo;
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
  durationMinutes?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient?: Patient;
  visitNumber: string;
  visitType: 'outpatient' | 'inpatient' | 'emergency' | 'follow_up';
  visitDate: string;
  doctorId?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OfflineRecord<T> {
  id: string;
  data: T;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}
