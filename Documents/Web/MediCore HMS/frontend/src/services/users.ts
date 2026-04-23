import api from './api';
import { ApiResponse, User, PaginatedResponse } from '@/types';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  phone?: string;
  specialty?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: User['role'];
  isActive?: boolean;
  phone?: string;
  specialty?: string;
}

export interface UserFilters {
  search?: string;
  role?: User['role'];
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const usersService = {
  getAll: async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/users', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (user: CreateUserData): Promise<ApiResponse<User>> => {
    const { data } = await api.post('/users', user);
    return data;
  },

  update: async (id: string, user: UpdateUserData): Promise<ApiResponse<User>> => {
    const { data } = await api.put(`/users/${id}`, user);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  toggleActive: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.patch(`/users/${id}/toggle-active`);
    return data;
  },
};