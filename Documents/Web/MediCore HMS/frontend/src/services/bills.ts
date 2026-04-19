import api from './api';
import { ApiResponse, Bill, PaginatedResponse, BillItem } from '@/types';

export interface BillFilters {
  patientId?: string;
  status?: Bill['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateBillData {
  patientId: string;
  dueDate: string;
  items: Omit<BillItem, 'id'>[];
  notes?: string;
}

export interface UpdateBillData {
  dueDate?: string;
  status?: Bill['status'];
  notes?: string;
}

export interface PaymentData {
  billId: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
}

export const billsService = {
  getAll: async (filters: BillFilters = {}): Promise<PaginatedResponse<Bill>> => {
    const { data } = await api.get('/bills', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Bill>> => {
    const { data } = await api.get(`/bills/${id}`);
    return data;
  },

  create: async (bill: CreateBillData): Promise<ApiResponse<Bill>> => {
    const { data } = await api.post('/bills', bill);
    return data;
  },

  update: async (id: string, bill: UpdateBillData): Promise<ApiResponse<Bill>> => {
    const { data } = await api.put(`/bills/${id}`, bill);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/bills/${id}`);
    return data;
  },

  addPayment: async (payment: PaymentData): Promise<ApiResponse<Bill>> => {
    const { data } = await api.post(`/bills/${payment.billId}/payments`, {
      amount: payment.amount,
      method: payment.method,
      notes: payment.notes,
    });
    return data;
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<Bill[]>> => {
    const { data } = await api.get(`/patients/${patientId}/bills`);
    return data;
  },
};