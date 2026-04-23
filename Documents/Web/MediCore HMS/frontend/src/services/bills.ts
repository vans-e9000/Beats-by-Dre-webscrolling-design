import api from './api';
import { ApiResponse, Bill, PaginatedResponse } from '@/types';

export interface BillFilters {
  patientId?: string;
  status?: Bill['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BillItemInput {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateBillData {
  patientId: string;
  visitId: string;
  dueDate: string;
  items: {
    serviceId?: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

export interface UpdateBillData {
  dueDate?: string;
  status?: Bill['status'] | 'cancelled';
  notes?: string;
}

export interface PaymentData {
  billId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance';
  referenceNumber?: string;
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
    const { data } = await api.post(`/bills/${payment.billId}/pay`, {
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes,
    });
    return data;
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<Bill[]>> => {
    const { data } = await api.get(`/bills/patient/${patientId}`);
    return data;
  },
};