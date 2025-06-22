<template>
  <div class="card">
    <DataTable
      :value="store.forklifts"
      :loading="store.isLoadingForklifts"
      v-model:selection="selectedForkliftRow"
      selectionMode="single"
      dataKey="id"
      @rowSelect="onRowSelect"
      @rowUnselect="onRowUnselect"
      responsiveLayout="scroll"
      scrollHeight="400px"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
      currentPageReportTemplate="Показано {first} по {last} из {totalRecords} погрузчиков"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      stateStorage="session"
      stateKey="forklift-table-state"
      class="p-datatable-sm"
    >
      <template #header>
        <div class="table-header">
          Список погрузчиков
        </div>
      </template>
      <template #empty>
        <div class="text-center p-4">Нет данных о погрузчиках.</div>
      </template>
      <template #loading>
        <div class="text-center p-4">
          <i class="pi pi-spin pi-spinner" style="font-size: 4rem;color: white;"></i>
          <p style="color: white; font-size: 2rem;">Загрузка данных...</p>
        </div>
      </template>

      <Column field="id" header="Код записи"  style="max-width: 60px; width: 8%"></Column>
      <Column field="mark" header="Марка" :sortable="true"  style="min-width: 80px;"></Column>
      <Column field="number" header="Номер" :sortable="true" style="min-width: 120px; width: 15%"></Column>
      <Column field="loadCapacity" header="Грузо подъемность" :sortable="true" style="min-width: 80px;">
        <template #body="slotProps">
          {{ formatLoadCapacity(slotProps.data.loadCapacity) }}
        </template>
      </Column>
      <Column field="isActive" header="Активен" :sortable="true" dataType="boolean" style="min-width: 80px; width: 8%">
        <template #body="slotProps">
          <i class="pi" :class="{'true-icon pi-check-circle': slotProps.data.isActive, 'false-icon pi-times-circle': !slotProps.data.isActive}"></i>
        </template>
      </Column>
      <Column field="updatedAt" header="Время и Дата изменения" :sortable="true" style="min-width: 140px; width: 15%">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.updatedAt) }}
        </template>
      </Column>
      <Column field="user" header="Поль зователь" :sortable="true" style="min-width: 120px;"></Column>
      <Column header="Действия" style="width: 10%; text-align: center" frozen alignFrozen="right">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-outlined p-button-success p-button-sm mr-2 mb-1" @click="editForklift(slotProps.data)" v-tooltip.top="'Редактировать'" />
          <Button icon="pi pi-trash" class="p-button-outlined p-button-warning p-button-sm mr-2 mb-1" @click="confirmDeleteForklift(slotProps.data)" v-tooltip.top="'Удалить'" />
        </template>
      </Column>
    </DataTable>

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog group="deleteForkliftDialog">
        <template #message="slotProps">
            <div class="flex align-items-center p-4">
                <i :class="slotProps.message.icon" style="font-size: 1.5rem"></i>
                <span class="ml-2">{{ slotProps.message.message }}</span>
            </div>
        </template>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForkliftStore } from '../stores/forkliftStore';
import type { ForkliftDto } from '../types/forklift';

// Импорт компонентов PrimeVue
import DataTable, { type DataTableRowSelectEvent, type DataTableRowUnselectEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog'; // Для подтверждения удаления
import { useConfirm } from "primevue/useconfirm"; // Хук для ConfirmDialog
import Tooltip from 'primevue/tooltip'; // Для всплывающих подсказок

const store = useForkliftStore();
const confirm = useConfirm();

// Локальное состояние для выбранной строки, чтобы избежать прямого изменения store.selectedForklift из DataTable
const selectedForkliftRow = ref<ForkliftDto | null>(null);

// Синхронизация локального выбора с store
watch(() => store.selectedForklift, (newVal) => {
  selectedForkliftRow.value = newVal;
});

const onRowSelect = (event: DataTableRowSelectEvent) => {
  if (event.data) {
    store.selectForklift(event.data as ForkliftDto);
  }
};

const onRowUnselect = (event: DataTableRowUnselectEvent) => {
  // Если строка была отменена выбором (например, кликом по уже выбранной при `toggle` режиме)
  // или если это нужно по логике (например, при множественном выборе, но у нас single)
  if (selectedForkliftRow.value && event.data && selectedForkliftRow.value.id === (event.data as ForkliftDto).id) {
     store.selectForklift(null);
  }
};

const formatDate = (value: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLoadCapacity = (value: number) => {
  // Отображаем с 3 знаками после запятой, если они есть, или как целое
  return parseFloat(value.toString()).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};

const editForklift = (forklift: ForkliftDto) => {
  store.openForkliftFormDialog(forklift);
};

const confirmDeleteForklift = (forklift: ForkliftDto) => {
  confirm.require({
    group: 'deleteForkliftDialog',
    message: `Вы уверены, что хотите удалить погрузчик № ${forklift.number}?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Да',
    rejectLabel: 'Нет',
    accept: async () => {
      await store.deleteForklift(forklift.id);
      // Если будет ошибка (например, из-за наличия простоев), она отобразится через Toast или alert из store
    },
    reject: () => {
      // Действие при отмене
    }
  });
};

// Директива для Tooltip (если не зарегистрирована глобально)
// Если PrimeVue настроен на авто-импорт директив, это может не понадобиться.
// В main.ts: app.directive('tooltip', Tooltip);
// Или локально:
const vTooltip = Tooltip;

</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.true-icon {
  color: var(--green-500); /* Используем CSS переменные PrimeVue для цветов */
}
.false-icon {
  color: var(--red-500);
}

/* Делаем таблицу немного компактнее */
:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
    padding: 0.75rem 0.75rem;
}
:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
    padding: 0.75rem 0.75rem;
}
:deep(.p-button.p-button-sm) {
    padding: 0.35rem 0.7rem; /* Уменьшаем padding для маленьких кнопок */
    font-size: 0.875rem; /* Уменьшаем шрифт для маленьких кнопок */
}
:deep(.p-button.p-button-sm .pi) {
    font-size: 0.875rem; /* Размер иконки */
}
</style>