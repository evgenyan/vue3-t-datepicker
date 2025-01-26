# vue3-t-datepicker - Datepicker для VUE3

<img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp1.png" width="200"/><img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp2.png" width="200"/><img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp3.png" width="200"/>

Простой и гибкий Datepicker компонент для VUE3.

**(For English language scroll down)**

## Возможности

1. Выбор одного дня
2. Выбор промежутка
3. Выбор месяца и года

## Установка

```shell
npm i vue3-t-datepicker
```

## Использование
```vue
import { createApp } from 'vue'
import App from './App.vue'

import TDatepicker from 'vue3-t-datepicker'; // Импортируйте компонент
import "vue3-t-datepicker/dist/vue3-t-datepicker.css" // Импортируйте стили

const app = createApp(App);

app.component('TDatepicker', TDatepicker);
// или
// import { install as TDatepickerPlugin } from 't-datepicker';
// app.use(TDatepickerPlugin);

app.mount('#app');
```
