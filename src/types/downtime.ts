export interface DowntimeDto {
  id: number;
  startTime: string; 
  endTime?: string | null; 
  problemDescription: string;
  forkliftId: number;
  downtimeDuration: string;
}

export interface CreateDowntimeDto {
  startTime: string; 
  endTime?: string | null;
  problemDescription: string;
  forkliftId: number;
}

export interface UpdateDowntimeDto {
  startTime: string;
  endTime?: string | null;
  problemDescription: string;
}