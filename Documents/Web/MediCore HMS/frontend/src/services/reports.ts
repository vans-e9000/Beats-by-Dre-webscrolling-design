import api from './api';
import { ApiResponse, DailySummary, RevenueReport } from '@/types';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const reportsService = {
  getDailySummary: async (date?: string): Promise<ApiResponse<DailySummary>> => {
    const { data } = await api.get('/reports/daily-summary', { params: { date } });
    return data;
  },

  getRevenueReport: async (range: DateRange): Promise<ApiResponse<RevenueReport>> => {
    const { data } = await api.get('/reports/revenue', { params: range });
    return data;
  },

  getRevenueByDate: async (range: DateRange): Promise<ApiResponse<{ date: string; revenue: number }[]>> => {
    const { data } = await api.get('/reports/revenue-by-date', { params: range });
    return data;
  },

  getPatientsByDate: async (range: DateRange): Promise<ApiResponse<{ date: string; patients: number }[]>> => {
    const { data } = await api.get('/reports/patients-by-date', { params: range });
    return data;
  },

  exportRevenueReport: async (range: DateRange): Promise<Blob> => {
    const { data } = await api.get('/reports/revenue/export', { params: range, responseType: 'blob' });
    return data;
  },

  exportPatientsReport: async (range: DateRange): Promise<Blob> => {
    const { data } = await api.get('/reports/patients/export', { params: range, responseType: 'blob' });
    return data;
  },
};