<template>
  <div class="card">
    <DataTable
      :value="store.downtimesForSelectedForklift"
      :loading="store.isLoadingDowntimes"
      responsiveLayout="scroll"
      scrollHeight="350px"
      :rows="5" 
      dataKey="id"
      class="p-datatable-sm"
      :paginator="store.downtimesForSelectedForklift.length > 5" 
      :alwaysShowPaginator="false"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      currentPageReportTemplate="{first} - {last} из {totalRecords}"
    >
      <template #empty>
        <div class="text-center p-3">Нет зарегистрированных простоев для этого погрузчика.</div>
      </template>
      <template #loading>
        <div class="text-center p-3">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem"></i>
          <p>Загрузка простоев...</p>
        </div>
      </template>

      <Column field="id" header="Код" :sortable="true" style="width: 10%"></Column>
      <Column field="startTime" header="Начало" :sortable="true" style="width: 25%">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.startTime) }}
        </template>
      </Column>
      <Column field="endTime" header="Окончание" :sortable="true" style="width: 25%">
        <template #body="slotProps">
          {{ slotProps.data.endTime ? formatDate(slotProps.data.endTime) : 'В работе' }}
        </template>
      </Column>
      <Column field="downtimeDuration" header="Время простоя" style="width: 20%"></Column>
      <Column field="problemDescription" header="Причина" style="width: 30%"></Column>
      <Column header="Действия" style="width: 10%; text-align: center" frozen alignFrozen="right">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-outlined p-button-success p-button-sm mr-2 mb-2" @click="editDowntime(slotProps.data)" v-tooltip.top="'Редактировать'" />
          <Button icon="pi pi-trash" class="p-button-outlined p-button-warning p-button-sm mr-2" @click="confirmDeleteDowntime(slotProps.data)" v-tooltip.top="'Удалить'" />
        </template>
      </Column>
    </DataTable>

    <ConfirmDialog group="deleteDowntimeDialog">
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
import { useForkliftStore } from '../stores/forkliftStore';
import type { DowntimeDto } from '../types/downtime';

// Импорт компонентов PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import Tooltip from 'primevue/tooltip'; // Если не зарегистрирована глобально

const store = useForkliftStore();
const confirm = useConfirm();

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

const editDowntime = (downtime: DowntimeDto) => {
  store.openDowntimeFormDialog(downtime);
};

const confirmDeleteDowntime = (downtime: DowntimeDto) => {
  confirm.require({
    group: 'deleteDowntimeDialog',
    message: `Вы уверены, что хотите удалить запись о простое от ${formatDate(downtime.startTime)}?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Да',
    rejectLabel: 'Нет',
    accept: async () => {
      await store.deleteDowntime(downtime.id);
    },
  });
};

// Для v-tooltip, если не зарегистрирована глобально
const vTooltip = Tooltip;
</script>

<style scoped>
/* Стили :deep() для компактности таблицы и кнопок можно скопировать из ForkliftTable.vue или определить глобально */
:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
    padding: 0.75rem 0.75rem;
}
:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
    padding: 0.75rem 0.75rem;
}
:deep(.p-button.p-button-sm) {
    padding: 0.35rem 0.7rem;
    font-size: 0.875rem;
}
:deep(.p-button.p-button-sm .pi) {
    font-size: 0.875rem;
}
</style>