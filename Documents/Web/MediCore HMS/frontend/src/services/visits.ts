import api from './api';
import { ApiResponse, Visit, PaginatedResponse } from '@/types';

export interface VisitFilters {
  patientId?: string;
  status?: Visit['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateVisitData {
  patientId: string;
  chiefComplaint?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  notes?: string;
}

export interface UpdateVisitData {
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  status?: Visit['status'];
  notes?: string;
}

export const visitsService = {
  getAll: async (filters: VisitFilters = {}): Promise<PaginatedResponse<Visit>> => {
    const { data } = await api.get('/visits', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Visit>> => {
    const { data } = await api.get(`/visits/${id}`);
    return data;
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const { data } = await api.get(`/patients/${patientId}/visits`);
    return data;
  },

  create: async (visit: CreateVisitData): Promise<ApiResponse<Visit>> => {
    const { data } = await api.post('/visits', visit);
    return data;
  },

  update: async (id: string, visit: UpdateVisitData): Promise<ApiResponse<Visit>> => {
    const { data } = await api.put(`/visits/${id}`, visit);
    return data;
  },

  complete: async (id: string, diagnosis: string, treatment: string): Promise<ApiResponse<Visit>> => {
    const { data } = await api.post(`/visits/${id}/complete`, { diagnosis, treatment });
    return data;
  },

  cancel: async (id: string): Promise<ApiResponse<Visit>> => {
    const { data } = await api.post(`/visits/${id}/cancel`);
    return data;
  },
};