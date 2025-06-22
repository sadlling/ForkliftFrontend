export interface ForkliftDto {
  id: number;
  mark: string;
  number: string;
  loadCapacity: number;
  isActive: boolean;
  updatedAt: string; // Даты приходят как строки из API
  user: string;
}

export interface CreateForkliftDto {
  mark: string;
  number: string;
  loadCapacity: number;
}

export interface UpdateForkliftDto {
  mark: string;
  number: string;
  loadCapacity: number;
  isActive: boolean;
}