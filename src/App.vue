<template>
  <div id="app-layout">
    <Toast position="top-right" /> 
    <!-- Верхняя панель -->
    <Toolbar style="background-color: #D32F2F; color: white; border-radius: 0;">
      <template #start></template>
      <template #end>
        <Button label="Профиль" icon="pi pi-user" class="p-button-text p-button-plain" style="color: white;" />
      </template>
    </Toolbar>

    <div class="main-container grid nogutter">
      <!-- Левая боковая панель -->
      <div class="sidebar col-fixed" style="width: 250px; background-color: #f8f9fa;">
        <nav class="p-4">
          <ul class="list-none p-0 m-0">
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round">Пользователи</a></li>
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round">Уведомления и напоминания</a></li>
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round">Настройки АИС ОГПА</a></li>
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round active-link">Справочник погрузчиков</a></li>
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round">Резервное копирование и восстановление</a></li>
            <li class="mb-2"><a href="#" class="nav-link p-2 block border-round">Справочники</a></li>
          </ul>
        </nav>
      </div>

      <!-- Основной контент -->
      <div class="main-content col p-4">
        <Toast />
        <header class="mb-4">
          <h2>Справочник погрузчиков</h2>
        </header>

        <!-- Обновленная секция forklift-controls для элементов в одну строку -->
        <section id="forklift-controls" class="mb-4">
          <div class="grid formgrid align-items-center">
            <!-- Группа: Метка, Поле ввода, Искать, Сбросить -->
            <div class="col-12 md:col fieldset-group p-fluid"> 
              <div class="grid align-items-center">
                <div class="col-fixed pr-2" style="width: auto;"> <!-- Метка -->
                  <label for="forkliftNumberSearch" class="font-semibold white-space-nowrap">Номер погрузчика</label>
                </div>
                <div class="col"> <!-- Поле ввода -->
                  <InputText id="forkliftNumberSearch" v-model="searchForkliftNumber" placeholder="Введите номер" />
                </div>
                <div class="col-fixed pl-2 pr-2"> <!-- Кнопка Искать -->
                  <Button @click="handleSearchForklifts" class="p-button-danger">
                    <span class="pi pi-search mr-1"></span>
                    <span>Искать</span>
                  </Button>
                </div>
                <div class="col-fixed pl-1"> <!-- Кнопка Сбросить фильтр -->
                  <Button @click="handleResetFilter" class="p-button-text p-button-plain btn-reset-filter">
                    <span class="pi pi-times mr-1"></span>
                    <span>Сбросить</span> <!-- Сократил текст для компактности -->
                  </Button>
                </div>
              </div>
            </div>

            <!-- Кнопка Добавить, выровненная вправо -->
            <div class="col-12 md:col-fixed ml-auto add-button-container">
              <Button label="Добавить" icon="pi pi-plus" @click="openNewForkliftDialog" class="p-button-danger" />
            </div>
          </div>
        </section>
        <!-- Конец обновленной секции -->

        <div class="grid">
          <div class="col-12" :class="store.selectedForklift ? 'md:col-7' : 'md:col-12'">
            <ForkliftTable />
          </div>
          <div v-if="store.selectedForklift" class="col-12 lg:col-5">
            <DowntimeSection />
          </div>
        </div>
      </div>
    </div>
    <ForkliftFormDialog />
    <DowntimeFormDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useForkliftStore } from './stores/forkliftStore';
// import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import Toast from 'primevue/toast';
import ForkliftTable from './components/ForkliftTable.vue';
import DowntimeSection from './components/DowntimeSection.vue';
import ForkliftFormDialog from './components/ForkliftFormDialog.vue';
import DowntimeFormDialog from './components/DowntimeFormDialog.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast(); 

const store = useForkliftStore();
// const { selectedForklift } = storeToRefs(store);
const searchForkliftNumber = ref('');
onMounted(() => { store.fetchForklifts(); });
const handleSearchForklifts = () => {
  store.fetchForklifts(searchForkliftNumber.value); // Поиск с учетом номера
};

const handleResetFilter = () => {
  searchForkliftNumber.value = '';
  store.fetchForklifts(); // Загружаем все погрузчики (сброс фильтра)
};

const openNewForkliftDialog = () => {
  store.openForkliftFormDialog(null);
};

watch(() => store.errorForklifts, (newError) => {
  if (newError) {
    toast.add({ severity: 'error', summary: 'Ошибка (Погрузчики)', detail: newError, life: 5000 });
    store.errorForklifts = null; 
  }
});

watch(() => store.errorDowntimes, (newError) => {
  if (newError) {
    toast.add({ severity: 'error', summary: 'Ошибка (Простои)', detail: newError, life: 5000 });
    store.errorDowntimes = null;
  }
});
</script>

<style>
/* Глобальные стили и стили макета - в основном остаются те же */
body, html { height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; background-color: #ECEFF1; }
#app-layout { display: flex; flex-direction: column; min-height: 100vh; }
.main-container { flex-grow: 1; }
.sidebar { border-right: 1px solid #dee2e6; background-color: #f8f9fa; }
.sidebar .nav-link { text-decoration: none; color: #495057; transition: background-color 0.2s; display: block; }
.sidebar .nav-link:hover { background-color: #e9ecef; }
.sidebar .active-link { color: #D32F2F !important; font-weight: bold; background-color: #e0e0e0; }
.main-content { background-color: #ffffff; }
.main-content header h2 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.75rem; color: #343a40; font-weight: 600; }

/* Стили для секции forklift-controls */
#forklift-controls .p-button-danger { background-color: #D32F2F !important; border-color: #D32F2F !important; color: white !important; }
#forklift-controls .p-button-danger:hover,
#forklift-controls .p-button-danger:focus { background-color: #C62828 !important; border-color: #C62828 !important; }

#forklift-controls .btn-reset-filter { color: #007bff !important; text-decoration: underline !important; box-shadow: none !important; border: none !important; background: transparent !important; padding: 0.5rem !important; }
#forklift-controls .btn-reset-filter:hover { background: rgba(0, 123, 255, 0.05) !important; }
#forklift-controls .btn-reset-filter .pi { margin-right: 0.25rem; }

/* Стили для новой структуры forklift-controls */
#forklift-controls .grid.formgrid { /* Родительский грид для всей строки */
  gap: 0.5rem; /* Отступы между основными группами (фильтр и кнопка "Добавить") */
}

#forklift-controls .fieldset-group .grid { /* Внутренний грид для метки, инпута и кнопок фильтра */
  gap: 0.5rem; /* Отступы между элементами фильтра */
}
#forklift-controls .fieldset-group .p-inputtext { /* Поле ввода в группе */
  width: 100%; /* Растягиваем на всю ширину своей колонки */
}

/* Колонки с фиксированной шириной для кнопок и метки */
.col-fixed {
  flex: 0 0 auto; /* Не растягивать, не сжимать, ширина по контенту */
}

/* PrimeFlex утилиты */
.pr-2 { padding-right: 0.5rem !important; }
.pl-2 { padding-left: 0.5rem !important; }
.pl-1 { padding-left: 0.25rem !important; }
.mr-1 { margin-right: 0.25rem !important; }
.ml-auto { margin-left: auto !important; }
.white-space-nowrap { white-space: nowrap !important; }

/* Контейнер для кнопки "Добавить", чтобы она была на той же линии */
.add-button-container {
  display: flex;
  align-items: center; /* Выравнивание кнопки по центру вертикально с остальными элементами */
}

</style>