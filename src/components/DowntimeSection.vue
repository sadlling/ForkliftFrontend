<template>
  <div class="downtime-section card">
    <div class="section-header p-3 surface-section border-bottom-1 surface-border">
      <h3 class="m-0">
        Простои по погрузчику: 
        <span v-if="store.selectedForklift" class="font-bold">{{ store.selectedForklift.number }}</span>
        <span v-else> (не выбран)</span>
      </h3>
      <Button 
        v-if="store.selectedForklift" 
        label="Добавить простой" 
        icon="pi pi-plus" 
        class="p-button-sm p-button-danger ml-auto" 
        @click="openNewDowntimeDialog"
      />
    </div>
    <div class="p-3">
      <DowntimeTable v-if="store.selectedForklift" />
      <p v-else class="text-center text-color-secondary">Выберите погрузчик для просмотра информации о простоях.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForkliftStore } from '../stores/forkliftStore';
import DowntimeTable from './DowntimeTable.vue';
import Button from 'primevue/button';

const store = useForkliftStore();

const openNewDowntimeDialog = () => {
  if (store.selectedForklift) {
    // Передаем null для создания нового, но привязываем к selectedForklift.id
    // В store.openDowntimeFormDialog нужно будет это учесть, 
    // чтобы forkliftId автоматически подставлялся для нового простоя
    store.openDowntimeFormDialog(null); 
  }
};
</script>

<style scoped>
.downtime-section.card {
  padding: 0; /* Убираем padding у card, т.к. header и content имеют свои */
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-header h3 {
  font-size: 1.25rem;
}
</style>