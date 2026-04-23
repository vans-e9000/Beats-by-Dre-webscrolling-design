import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'accountant', 'lab_technician']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

export const billItemSchema = z.object({
  serviceId: z.string().optional(),
  serviceName: z.string().min(1, 'Service name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
});

export const billSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  visitId: z.string().min(1, 'Visit is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(billItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'mobile_money', 'insurance']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
export type BillFormData = z.infer<typeof billSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;