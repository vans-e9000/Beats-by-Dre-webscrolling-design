import api from './api';
import { ApiResponse, Patient, PaginatedResponse } from '@/types';

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Patient['gender'];
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
}

export const patientsService = {
  getAll: async (filters: PatientFilters = {}): Promise<PaginatedResponse<Patient>> => {
    const { data } = await api.get('/patients', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },

  create: async (patient: CreatePatientData): Promise<ApiResponse<Patient>> => {
    const { data } = await api.post('/patients', patient);
    return data;
  },

  update: async (id: string, patient: Partial<CreatePatientData>): Promise<ApiResponse<Patient>> => {
    const { data } = await api.put(`/patients/${id}`, patient);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/patients/${id}`);
    return data;
  },

  search: async (query: string): Promise<ApiResponse<Patient[]>> => {
    const { data } = await api.get('/patients/search', { params: { q: query } });
    return data;
  },
};