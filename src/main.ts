import { createApp } from 'vue'
import { createPinia } from 'pinia' 
import App from './App.vue'
import './style.css'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice';

import 'primevue/resources/themes/saga-blue/theme.css'; 
import 'primevue/resources/primevue.min.css'; 
import 'primeicons/primeicons.css';    
import 'primeflex/primeflex.css'     
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(PrimeVue)
app.use(ConfirmationService);
app.use(ToastService);
app.directive('tooltip', Tooltip); 
app.use(createPinia())
app.mount('#app')
