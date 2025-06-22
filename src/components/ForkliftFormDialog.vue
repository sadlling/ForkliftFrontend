<template>
  <Dialog
    v-model:visible="store.isForkliftFormDialogVisible"
    :header="dialogHeader"
    :modal="true"
    :style="{ width: '450px' }"
    class="p-fluid"
    @hide="onDialogHide"
  >
    <div class="field">
      <label for="mark">Марка погрузчика</label>
      <InputText id="mark" v-model.trim="forkliftData.mark" required autofocus :invalid="isSubmitted && !forkliftData.mark" />
      <small class="p-error" v-if="isSubmitted && !forkliftData.mark">Марка обязательна.</small>
      <!-- Можно добавить вывод ошибок валидации с сервера, если они есть в store.errorForklifts -->
    </div>

    <div class="field">
      <label for="number">Номер погрузчика</label>
      <InputText id="number" v-model.trim="forkliftData.number" required :invalid="isSubmitted && !forkliftData.number" />
      <small class="p-error" v-if="isSubmitted && !forkliftData.number">Номер обязателен.</small>
    </div>

    <div class="field">
      <label for="loadCapacity">Грузоподъемность (кг)</label>
      <InputNumber id="loadCapacity" v-model="forkliftData.loadCapacity" mode="decimal" :minFractionDigits="0" :maxFractionDigits="3" required :invalid="isSubmitted && forkliftData.loadCapacity == null" />
      <small class="p-error" v-if="isSubmitted && forkliftData.loadCapacity == null">Грузоподъемность обязательна.</small>
      <small class="p-error" v-if="isSubmitted && forkliftData.loadCapacity != null && forkliftData.loadCapacity <= 0">Грузоподъемность должна быть больше нуля.</small>
    </div>

    <div class="field" v-if="store.editingForklift"> <!-- Поле Активен только при редактировании -->
      <label for="isActive" class="mb-3">Активен</label>
      <InputSwitch id="isActive" v-model="forkliftData.isActive" />
    </div>

    <!-- Отображение ошибок с сервера -->
    <Message v-if="serverError" severity="error" :closable="false" class="mb-3">{{ serverError }}</Message>


    <template #footer>
      <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button :label="saveButtonLabel" icon="pi pi-check" :loading="isSaving" @click="saveForklift" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue';
import { useForkliftStore } from '../stores/forkliftStore';
import type {  CreateForkliftDto, UpdateForkliftDto } from '../types/forklift';

// Импорт компонентов PrimeVue
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import Button from 'primevue/button';
import Message from 'primevue/message';


const store = useForkliftStore();

const initialForkliftData = (): UpdateForkliftDto & { id?: number, isActive?: boolean } => ({
  mark: '',
  number: '',
  loadCapacity: 0, // Инициализируем как null для InputNumber
  isActive: true, // По умолчанию для нового, будет перезаписано для редактируемого
});

const forkliftData = ref(initialForkliftData());
const isSubmitted = ref(false);
const isSaving = ref(false);
const serverError = ref<string | null>(null);

const dialogHeader = computed(() => store.editingForklift ? 'Редактировать погрузчик' : 'Добавить погрузчик');
const saveButtonLabel = computed(() => store.editingForklift ? 'Сохранить' : 'Добавить');

// Следим за состоянием editingForklift в store, чтобы заполнить форму
watch(() => store.editingForklift, (editingData) => {
  if (store.isForkliftFormDialogVisible && editingData) {
    // Редактирование существующего
    forkliftData.value = { ...editingData, loadCapacity: Number(editingData.loadCapacity) }; // Убедимся, что loadCapacity - число
  } else if (store.isForkliftFormDialogVisible && !editingData) {
    // Создание нового
    forkliftData.value = initialForkliftData();
  }
  isSubmitted.value = false; // Сбрасываем флаг валидации при открытии/смене данных
  serverError.value = null; // Сброс ошибки сервера
}, { immediate: true, deep: true }); // immediate для инициализации при первом открытии

// Следим за ошибками из стора (если они там централизованно обрабатываются)
// watch(() => store.errorForklifts, (newError) => {
//   if (newError && store.isForkliftFormDialogVisible) { // Показываем ошибку только если диалог открыт
//     serverError.value = newError;
//   }
// });


const hideDialog = () => {
  store.closeForkliftFormDialog();
};

const onDialogHide = () => { // Вызывается при закрытии диалога любым способом
  isSubmitted.value = false;
  forkliftData.value = initialForkliftData(); // Сброс формы
  serverError.value = null;
  // store.errorForklifts = null; // Если ошибки сбрасываются в сторе при закрытии
};


const validateForm = (): boolean => {
  serverError.value = null; // Сброс предыдущей серверной ошибки
  if (!forkliftData.value.mark || !forkliftData.value.number || forkliftData.value.loadCapacity == null || forkliftData.value.loadCapacity <= 0) {
    return false;
  }
  return true;
};

const saveForklift = async () => {
  isSubmitted.value = true;
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  serverError.value = null;
  let success = false;

  try {
    if (store.editingForklift && forkliftData.value.id != null) {
      // Редактирование
      const dataToUpdate: UpdateForkliftDto = {
        mark: forkliftData.value.mark,
        number: forkliftData.value.number,
        loadCapacity: forkliftData.value.loadCapacity as number,
        isActive: forkliftData.value.isActive as boolean,
      };
      success = await store.updateForklift(forkliftData.value.id, dataToUpdate);
    } else {
      // Создание
      const dataToCreate: CreateForkliftDto = {
        mark: forkliftData.value.mark,
        number: forkliftData.value.number,
        loadCapacity: forkliftData.value.loadCapacity as number,
      };
      success = await store.addForklift(dataToCreate);
    }

    if (success) {
      hideDialog();
    } else {
      // Ошибка была обработана в store и, возможно, записана в store.errorForklifts
      // Если store.errorForklifts используется для отображения, то можно его здесь показать
      if (store.errorForklifts) {
          serverError.value = store.errorForklifts;
      } else {
          serverError.value = "Произошла неизвестная ошибка при сохранении.";
      }
    }
  } catch (error) { // На случай непредвиденных ошибок, не пойманных в store
    console.error("Save forklift error:", error);
    serverError.value = "Произошла критическая ошибка.";
    success = false;
  } finally {
    isSaving.value = false;
  }
};

// Сброс ошибки при закрытии диалога, если она не была обработана
onUnmounted(() => {
    if (store.isForkliftFormDialogVisible) { // Если компонент уничтожается, а диалог все еще "открыт" в сторе
        store.closeForkliftFormDialog(); // Закрываем его, чтобы сбросить состояние в сторе
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
/* Убедимся, что InputNumber тоже растягивается */
:deep(.p-inputnumber) {
    width: 100%;
}
</style>