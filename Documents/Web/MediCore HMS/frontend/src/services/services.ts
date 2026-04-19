import api from './api';
import { ApiResponse, Service } from '@/types';

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  category?: string;
  active?: boolean;
}

export const servicesService = {
  getAll: async (): Promise<ApiResponse<Service[]>> => {
    const { data } = await api.get('/services');
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },

  create: async (service: CreateServiceData): Promise<ApiResponse<Service>> => {
    const { data } = await api.post('/services', service);
    return data;
  },

  update: async (id: string, service: Partial<CreateServiceData>): Promise<ApiResponse<Service>> => {
    const { data } = await api.put(`/services/${id}`, service);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/services/${id}`);
    return data;
  },

  search: async (query: string): Promise<ApiResponse<Service[]>> => {
    const { data } = await api.get('/services/search', { params: { q: query } });
    return data;
  },
};