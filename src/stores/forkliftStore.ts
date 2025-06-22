import { defineStore } from 'pinia';
import { forkliftService } from '../services/forkliftService';
import { downtimeService } from '../services/downtimeService';
import type { ForkliftDto, CreateForkliftDto, UpdateForkliftDto } from '../types/forklift';
import type { DowntimeDto, CreateDowntimeDto, UpdateDowntimeDto } from '../types/downtime';

interface ForkliftState {
  forklifts: ForkliftDto[];
  selectedForklift: ForkliftDto | null;
  downtimesForSelectedForklift: DowntimeDto[];
  isLoadingForklifts: boolean;
  isLoadingDowntimes: boolean;
  errorForklifts: string | null;
  errorDowntimes: string | null;
  isForkliftFormDialogVisible: boolean;
  isDowntimeFormDialogVisible: boolean;
  editingForklift: ForkliftDto | null; // Для редактирования существующего или null для нового
  editingDowntime: DowntimeDto | null; // Для редактирования существующего или null для нового
}

export const useForkliftStore = defineStore('forklift', {
  state: (): ForkliftState => ({
    forklifts: [],
    selectedForklift: null,
    downtimesForSelectedForklift: [],
    isLoadingForklifts: false,
    isLoadingDowntimes: false,
    errorForklifts: null,
    errorDowntimes: null,
    isForkliftFormDialogVisible: false,
    isDowntimeFormDialogVisible: false,
    editingForklift: null,
    editingDowntime: null,
  }),

  getters: {
    // Можно добавить геттеры, если нужна производная информация
    // например, getSelectedForkliftNumber(): string | null {
    //   return this.selectedForklift ? this.selectedForklift.number : null;
    // }
  },

  actions: {
    async fetchForklifts(number?: string) {
      this.isLoadingForklifts = true;
      this.errorForklifts = null;
      try {
        this.forklifts = await forkliftService.getForklifts(number);
      } catch (error: any) {
        this.errorForklifts = error.response?.data?.message || error.message || 'Не удалось загрузить погрузчики';
        this.forklifts = []; // Очистить список в случае ошибки
      } finally {
        this.isLoadingForklifts = false;
      }
    },

    selectForklift(forklift: ForkliftDto | null) {
      this.selectedForklift = forklift;
      if (forklift) {
        this.fetchDowntimesForSelectedForklift(forklift.id);
      } else {
        this.downtimesForSelectedForklift = []; // Очистить простои, если погрузчик не выбран
      }
    },

    async addForklift(forkliftData: CreateForkliftDto) {
      // Оптимистичное обновление или обновление после ответа сервера
      try {
        const newForklift = await forkliftService.createForklift(forkliftData);
        this.forklifts.unshift(newForklift); // Добавляем в начало списка
        // Или this.fetchForklifts(); // Полное обновление списка
        this.closeForkliftFormDialog();
        return true; // Успех
      } catch (error: any) {
        // Обработка ошибок валидации от сервера
        if (error.response && error.response.status === 400 && error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
            this.errorForklifts = `Ошибка валидации: ${errorMessages}`;
        } else {
            this.errorForklifts = error.response?.data?.message || error.message || 'Ошибка при создании погрузчика';
        }
        return false; // Неудача
      }
    },

    async updateForklift(id: number, forkliftData: UpdateForkliftDto) {
      try {
        await forkliftService.updateForklift(id, forkliftData);
        // Обновить запись в локальном списке
        const index = this.forklifts.findIndex(f => f.id === id);
        if (index !== -1) {
          const updatedForklift = await forkliftService.getForkliftById(id);
          this.forklifts[index] = updatedForklift;
          if (this.selectedForklift && this.selectedForklift.id === id) {
            this.selectedForklift = { ...updatedForklift };
          }
        }
        this.closeForkliftFormDialog();
        return true;
      } catch (error: any) {
        if (error.response && error.response.status === 400 && error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
            this.errorForklifts = `Ошибка валидации: ${errorMessages}`;
        } else {
            this.errorForklifts = error.response?.data?.message || error.message || 'Ошибка при обновлении погрузчика';
        }
        return false;
      }
    },

    async deleteForklift(id: number) {
      try {
        await forkliftService.deleteForklift(id);
        this.forklifts = this.forklifts.filter(f => f.id !== id);
        if (this.selectedForklift && this.selectedForklift.id === id) {
          this.selectForklift(null); // Сбросить выбор, если удален выбранный
        }
      } catch (error: any) {
        this.errorForklifts = error.response?.data || error.message || 'Ошибка при удалении погрузчика';
      }
    },

    // Управление видимостью модального окна для погрузчика
    openForkliftFormDialog(forkliftToEdit: ForkliftDto | null = null) {
      this.editingForklift = forkliftToEdit ? { ...forkliftToEdit } : null; // Копируем для редактирования
      this.isForkliftFormDialogVisible = true;
    },
    closeForkliftFormDialog() {
      this.isForkliftFormDialogVisible = false;
      this.editingForklift = null;
      this.errorForklifts = null; // Сброс ошибок при закрытии диалога
    },

    // --- Downtime Actions ---
    async fetchDowntimesForSelectedForklift(forkliftId: number) {
      if (!forkliftId) return;
      this.isLoadingDowntimes = true;
      this.errorDowntimes = null;
      try {
        this.downtimesForSelectedForklift = await downtimeService.getDowntimesByForkliftId(forkliftId);
      } catch (error: any) {
        this.errorDowntimes = error.response?.data?.message || error.message || 'Не удалось загрузить простои';
        this.downtimesForSelectedForklift = [];
      } finally {
        this.isLoadingDowntimes = false;
      }
    },

    async addDowntime(downtimeData: CreateDowntimeDto) {
        try {
            const newDowntime = await downtimeService.createDowntime(downtimeData);
            // Добавляем новый простой в список, сохраняя сортировку (в начало, т.к. сортировка по убыванию даты)
            this.downtimesForSelectedForklift.unshift(newDowntime);
            this.closeDowntimeFormDialog();
            return true;
        } catch (error: any) {
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
                this.errorDowntimes = `Ошибка валидации: ${errorMessages}`;
            } else {
                this.errorDowntimes = error.response?.data?.message || error.message || 'Ошибка при добавлении простоя';
            }
            return false;
        }
    },

    async updateDowntime(id: number, downtimeData: UpdateDowntimeDto) {
        try {
            await downtimeService.updateDowntime(id, downtimeData);
            const index = this.downtimesForSelectedForklift.findIndex(d => d.id === id);
            if (index !== -1 && this.selectedForklift) {
                await this.fetchDowntimesForSelectedForklift(this.selectedForklift.id);
            }
            this.closeDowntimeFormDialog();
            return true;
        } catch (error: any) {
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
                this.errorDowntimes = `Ошибка валидации: ${errorMessages}`;
            } else {
                this.errorDowntimes = error.response?.data?.message || error.message || 'Ошибка при обновлении простоя';
            }
            return false;
        }
    },

    async deleteDowntime(id: number) {
        try {
            await downtimeService.deleteDowntime(id);
            this.downtimesForSelectedForklift = this.downtimesForSelectedForklift.filter(d => d.id !== id);
        } catch (error: any) {
            this.errorDowntimes = error.response?.data?.message || error.message || 'Ошибка при удалении простоя';
        }
    },
    
    // Управление видимостью модального окна для простоя
    openDowntimeFormDialog(downtimeToEdit: DowntimeDto | null = null) {
      this.editingDowntime = downtimeToEdit ? { ...downtimeToEdit } : null; // Копируем для редактирования
      this.isDowntimeFormDialogVisible = true;
    },
    closeDowntimeFormDialog() {
      this.isDowntimeFormDialogVisible = false;
      this.editingDowntime = null;
      this.errorDowntimes = null; // Сброс ошибок при закрытии диалога
    },
  },
});