<template>
  <Dialog
    v-model:visible="store.isDowntimeFormDialogVisible"
    :header="dialogHeader"
    :modal="true"
    :style="{ width: '500px' }"
    class="p-fluid"
    @hide="onDialogHide"
  >
    <div class="field">
      <label for="startTime">Дата и время начала простоя</label>
      <Calendar 
        id="startTime" 
        v-model="downtimeData.startTime" 
        showTime 
        hourFormat="24" 
        dateFormat="dd.mm.yy"
        required 
        autofocus 
        :invalid="isSubmitted && !downtimeData.startTime" 
        showIcon
        appendTo="body" 
      />
      <small class="p-error" v-if="isSubmitted && !downtimeData.startTime">Дата и время начала обязательны.</small>
    </div>

    <div class="field">
      <label for="endTime">Дата и время окончания простоя</label>
      <Calendar 
        id="endTime" 
        v-model="downtimeData.endTime" 
        showTime 
        hourFormat="24" 
        dateFormat="dd.mm.yy"
        :invalid="isSubmitted && downtimeData.endTime != null && downtimeData.startTime != null && new Date(downtimeData.endTime) < new Date(downtimeData.startTime)"
        showIcon
        appendTo="body"
        :minDate="downtimeData.startTime ? new Date(downtimeData.startTime) : undefined"
      />
      <small 
        class="p-error" 
        v-if="isSubmitted && downtimeData.endTime != null && downtimeData.startTime != null && new Date(downtimeData.endTime) < new Date(downtimeData.startTime)"
      >
        Дата окончания не может быть раньше даты начала.
      </small>
      <small class="p-text-muted block mt-1">Оставьте пустым, если инцидент действующий.</small>
    </div>

    <div class="field">
      <label for="problemDescription">Описание проблемы</label>
      <Textarea id="problemDescription" v-model.trim="downtimeData.problemDescription" required rows="3" cols="20" :invalid="isSubmitted && !downtimeData.problemDescription" />
      <small class="p-error" v-if="isSubmitted && !downtimeData.problemDescription">Описание проблемы обязательно.</small>
    </div>
    
    <!-- Отображение ошибок с сервера -->
    <Message v-if="serverError" severity="error" :closable="false" class="mb-3">{{ serverError }}</Message>

    <template #footer>
      <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button :label="saveButtonLabel" icon="pi pi-check" :loading="isSaving" @click="saveDowntime" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue';
import { useForkliftStore } from '../stores/forkliftStore';
import type { DowntimeDto, CreateDowntimeDto, UpdateDowntimeDto } from '../types/downtime';

import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';

const store = useForkliftStore();

interface DowntimeFormData {
  id?: number;
  startTime: Date | null;
  endTime: Date | null;
  problemDescription: string;
  forkliftId?: number; // Будет установлено при создании нового
}

const initialDowntimeData = (): DowntimeFormData => ({
  startTime: null,
  endTime: null,
  problemDescription: '',
});

const downtimeData = ref<DowntimeFormData>(initialDowntimeData());
const isSubmitted = ref(false);
const isSaving = ref(false);
const serverError = ref<string | null>(null);

const dialogHeader = computed(() => store.editingDowntime ? 'Редактировать информацию о простое' : 'Зарегистрировать новый простой');
const saveButtonLabel = computed(() => store.editingDowntime ? 'Сохранить' : 'Добавить');

watch(() => store.editingDowntime, (editingData) => {
  if (store.isDowntimeFormDialogVisible) {
    if (editingData) {
      // Редактирование существующего
      downtimeData.value = { 
        ...editingData,
        startTime: editingData.startTime ? new Date(editingData.startTime) : null,
        endTime: editingData.endTime ? new Date(editingData.endTime) : null,
      };
    } else {
      // Создание нового
      downtimeData.value = {
        ...initialDowntimeData(),
        // По заданию: "дата и время начала заполняются автоматически текущим значением с возможностью изменения"
        // Но так как АРМ водителя нет, сделаем просто текущее значение
        startTime: new Date(), 
      };
    }
  }
  isSubmitted.value = false;
  serverError.value = null;
}, { immediate: true, deep: true });


const hideDialog = () => {
  store.closeDowntimeFormDialog();
};

const onDialogHide = () => {
  isSubmitted.value = false;
  downtimeData.value = initialDowntimeData(); // Сброс формы
  serverError.value = null;
  // store.errorDowntimes = null; // Если ошибки сбрасываются в сторе
};

const validateForm = (): boolean => {
  serverError.value = null;
  if (!downtimeData.value.startTime || !downtimeData.value.problemDescription) {
    return false;
  }
  if (downtimeData.value.endTime && downtimeData.value.startTime && new Date(downtimeData.value.endTime) < new Date(downtimeData.value.startTime)) {
    return false;
  }
  return true;
};

const saveDowntime = async () => {
  isSubmitted.value = true;
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  serverError.value = null;
  let success = false;

  try {
    // Преобразуем даты в ISO строки для отправки на сервер, если они не null
    const startTimeISO = downtimeData.value.startTime ? new Date(downtimeData.value.startTime).toISOString() : undefined;
    const endTimeISO = downtimeData.value.endTime ? new Date(downtimeData.value.endTime).toISOString() : null; // null если не выбрано

    if (store.editingDowntime && downtimeData.value.id != null) {
      // Редактирование
      const dataToUpdate: UpdateDowntimeDto = {
        startTime: startTimeISO as string, // startTime обязателен
        endTime: endTimeISO,
        problemDescription: downtimeData.value.problemDescription,
      };
      success = await store.updateDowntime(downtimeData.value.id, dataToUpdate);
    } else {
      // Создание
      if (!store.selectedForklift) {
        serverError.value = "Не выбран погрузчик для добавления простоя.";
        isSaving.value = false;
        return;
      }
      const dataToCreate: CreateDowntimeDto = {
        startTime: startTimeISO as string, // startTime обязателен
        endTime: endTimeISO,
        problemDescription: downtimeData.value.problemDescription,
        forkliftId: store.selectedForklift.id,
      };
      success = await store.addDowntime(dataToCreate);
    }

    if (success) {
      hideDialog();
    } else {
      if (store.errorDowntimes) {
        serverError.value = store.errorDowntimes;
      } else {
        serverError.value = "Произошла ошибка при сохранении информации о простое.";
      }
    }
  } catch (error) {
    console.error("Save downtime error:", error);
    serverError.value = "Произошла критическая ошибка.";
    success = false;
  } finally {
    isSaving.value = false;
  }
};

onUnmounted(() => {
    if (store.isDowntimeFormDialogVisible) {
        store.closeDowntimeFormDialog();
    }
});

</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
/* Убедимся, что Calendar растягивается */
:deep(.p-calendar) {
    width: 100%;
}
.p-text-muted {
    font-size: 0.875rem;
}
</style>