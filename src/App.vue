<template>
  <div id="app-layout">
    <Toast position="top-right" />
    <Toolbar style="background-color: #D32F2F; color: white; border-radius: 0;">
      <template #start>
        <Button icon="pi pi-bars" class="p-button-text p-button-plain mr-2 lg:hidden" @click="sidebarVisible = true" style="color: white;" />
      </template>
      <template #end>
        <Button label="Профиль" icon="pi pi-user" class="p-button-text p-button-plain" style="color: white;" />
      </template>
    </Toolbar>

    <Sidebar v-model:visible="sidebarVisible" position="left" class="w-full md:w-20rem lg:w-30rem">
      <nav class="p-4">
        <ul class="list-none p-0 m-0">
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round" @click="sidebarVisible = false">Пользователи</a></li>
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round" @click="sidebarVisible = false">Уведомления и напоминания</a></li>
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round" @click="sidebarVisible = false">Настройки АИС ОГПА</a></li>
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round active-link" @click="sidebarVisible = false">Справочник погрузчиков</a></li>
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round" @click="sidebarVisible = false">Резервное копирование и восстановление</a></li>
          <li class="mb-2"><a href="#" class="nav-link p-2 block border-round" @click="sidebarVisible = false">Справочники</a></li>
        </ul>
      </nav>
    </Sidebar>

    <div class="main-container grid nogutter">
      <div class="sidebar-desktop col-fixed hidden lg:block" style="width: 250px; background-color: #f8f9fa;">
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

      <div class="main-content col p-4">
        <header class="mb-4">
          <h2>Справочник погрузчиков</h2>
        </header>

        <section id="forklift-controls" class="mb-4">
          <div class="grid formgrid align-items-center"> 
        
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

            <div class="col-12 md:col-fixed mt-2 md:mt-0 md:ml-auto">
              <Button label="Добавить" icon="pi pi-plus" @click="openNewForkliftDialog" class="p-button-danger w-full md:w-auto" />
            </div>
          </div>
        </section>

        <div class="grid">
          <div class="col-12" :class="store.selectedForklift ? 'md:col-7' : 'md:col-12'">
            <ForkliftTable />
          </div>
          <div v-if="store.selectedForklift" class="col-12 md:col-5">
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
// ... скрипт остается тот же
import { ref, onMounted, watch } from 'vue';
import { useForkliftStore } from './stores/forkliftStore';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import Sidebar from 'primevue/sidebar';
import Toast from 'primevue/toast';
import ForkliftTable from './components/ForkliftTable.vue';
import DowntimeSection from './components/DowntimeSection.vue';
import ForkliftFormDialog from './components/ForkliftFormDialog.vue';
import DowntimeFormDialog from './components/DowntimeFormDialog.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const store = useForkliftStore();
const searchForkliftNumber = ref('');
const sidebarVisible = ref(false);

onMounted(() => { store.fetchForklifts(); });
const handleSearchForklifts = () => { store.fetchForklifts(searchForkliftNumber.value); };
const handleResetFilter = () => { searchForkliftNumber.value = ''; store.fetchForklifts(); };
const openNewForkliftDialog = () => { store.openForkliftFormDialog(null); };

watch(() => store.errorForklifts, (newError) => {
  if (newError) { toast.add({ severity: 'error', summary: 'Ошибка (Погрузчики)', detail: newError, life: 5000 }); store.errorForklifts = null; }
});
watch(() => store.errorDowntimes, (newError) => {
  if (newError) { toast.add({ severity: 'error', summary: 'Ошибка (Простои)', detail: newError, life: 5000 }); store.errorDowntimes = null; }
});
</script>

<style>
/* Глобальные стили и стили макета - в основном остаются те же */
body, html { height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; background-color: #ECEFF1; }
#app-layout { display: flex; flex-direction: column; min-height: 100vh; }
.main-container { flex-grow: 1; }
.sidebar-desktop { border-right: 1px solid #dee2e6; background-color: #f8f9fa; }
.sidebar-desktop .nav-link, .p-sidebar .nav-link { text-decoration: none; color: #495057; transition: background-color 0.2s; display: block; }
.sidebar-desktop .nav-link:hover, .p-sidebar .nav-link:hover { background-color: #e9ecef; }
.sidebar-desktop .active-link, .p-sidebar .active-link { color: #D32F2F !important; font-weight: bold; background-color: #e0e0e0; }
.main-content { background-color: #ffffff; overflow-x: hidden; }
.main-content header h2 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.75rem; color: #343a40; font-weight: 600; }

#forklift-controls .p-button-danger { background-color: #D32F2F !important; border-color: #D32F2F !important; color: white !important; }
#forklift-controls .p-button-danger:hover, #forklift-controls .p-button-danger:focus { background-color: #C62828 !important; border-color: #C62828 !important; }
#forklift-controls .btn-reset-filter { color: #007bff !important; text-decoration: underline !important; box-shadow: none !important; border: none !important; background: transparent !important; padding: 0.5rem !important; }
#forklift-controls .btn-reset-filter:hover { background: rgba(0, 123, 255, 0.05) !important; }
#forklift-controls .btn-reset-filter .pi { margin-right: 0.25rem; }

#forklift-controls .grid.formgrid { gap: 0.5rem; }
#forklift-controls .p-inputtext { width: 100%; } /* InputText внутри .col будет растягиваться */

/* Адаптивность для группы фильтров */
#forklift-controls .grid > .col-12.md\:col > .p-fluid > .grid > .field {
  margin-bottom: 0.5rem; /* Отступ для элементов на мобильных */
}
@media (min-width: 576px) { /* sm и больше */
  #forklift-controls .grid > .col-12.md\:col > .p-fluid > .grid > .field {
    margin-bottom: 0; /* Убираем отступ, т.к. элементы в строку */
  }
}


/* PrimeFlex утилиты и другие */
.col-fixed { flex: 0 0 auto; }
.pr-0 { padding-right: 0 !important; } .pr-2 { padding-right: 0.5rem !important; }
.pl-0 { padding-left: 0 !important; } .pl-1 { padding-left: 0.25rem !important; } .pl-2 { padding-left: 0.5rem !important; }
.mr-1 { margin-right: 0.25rem !important; } .mr-2 { margin-right: 0.5rem !important; }
.ml-auto { margin-left: auto !important; } .ml-0 { margin-left: 0 !important; }
.mt-2 { margin-top: 0.5rem !important; } .md\:mt-0 { @media (min-width: 768px) { margin-top: 0 !important; } }
.white-space-nowrap { white-space: nowrap !important; }
.add-button-container { display: flex; align-items: center; }
.hidden { display: none !important; }
.lg\:hidden { @media (min-width: 992px) { display: none !important; } }
.lg\:block { @media (min-width: 992px) { display: block !important; } }
.w-full { width: 100% !important; }
.sm\:w-auto { @media (min-width: 576px) { width: auto !important; } }
.md\:w-auto { @media (min-width: 768px) { width: auto !important; } }
.sm\:inline { @media (min-width: 576px) { display: inline !important; } } /* Для показа текста кнопок */
.sm\:pr-2 { @media (min-width: 576px) { padding-right: 0.5rem !important; } }
.sm\:pl-2 { @media (min-width: 576px) { padding-left: 0.5rem !important; } }
.sm\:pl-1 { @media (min-width: 576px) { padding-left: 0.25rem !important; } }
.sm\:mb-0 { @media (min-width: 576px) { margin-bottom: 0 !important; } }


:deep(.p-sidebar .p-sidebar-header) { padding: 0.75rem 1rem; }
:deep(.p-sidebar .p-sidebar-content) { padding: 0; }
</style>