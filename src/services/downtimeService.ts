import apiClient from './apiClient';
import type { DowntimeDto, CreateDowntimeDto, UpdateDowntimeDto } from '../types/downtime';

export const downtimeService = {
  async getDowntimesByForkliftId(forkliftId: number): Promise<DowntimeDto[]> {
    const response = await apiClient.get<DowntimeDto[]>('/downtimes', {
      params: { forkliftId },
    });
    return response.data;
  },

  async createDowntime(data: CreateDowntimeDto): Promise<DowntimeDto> {
    const response = await apiClient.post<DowntimeDto>('/downtimes', data);
    return response.data;
  },

  async updateDowntime(id: number, data: UpdateDowntimeDto): Promise<void> {
    await apiClient.put(`/downtimes/${id}`, data);
  },

  async deleteDowntime(id: number): Promise<void> {
    await apiClient.delete(`/downtimes/${id}`);
  },
};