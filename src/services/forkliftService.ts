import apiClient from './apiClient';
import type { ForkliftDto, CreateForkliftDto, UpdateForkliftDto } from '../types/forklift';

export const forkliftService = {
  async getForklifts(number?: string): Promise<ForkliftDto[]> {
    const params: { number?: string } = {};
    if (number && number.trim() !== '') {
      params.number = number;
    }
    const response = await apiClient.get<ForkliftDto[]>('/forklifts', { params });
    return response.data;
  },

  async getForkliftById(id: number): Promise<ForkliftDto> {
    const response = await apiClient.get<ForkliftDto>(`/forklifts/${id}`);
    return response.data;
  },

  async createForklift(data: CreateForkliftDto): Promise<ForkliftDto> {
    const response = await apiClient.post<ForkliftDto>('/forklifts', data);
    return response.data;
  },

  async updateForklift(id: number, data: UpdateForkliftDto): Promise<void> {
    await apiClient.put(`/forklifts/${id}`, data);
  },

  async deleteForklift(id: number): Promise<void> {
    await apiClient.delete(`/forklifts/${id}`);
  },
};