# vue3-t-datepicker - Datepicker для VUE3

<img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp1.png" width="200"/><img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp2.png" width="200"/><img src="https://raw.githubusercontent.com/evgenyan/vue3-t-datepicker/refs/heads/main/screenshots/tdp3.png" width="200"/>

Простой и гибкий Datepicker компонент для VUE3.


## Возможности

1. Выбор одного дня
2. Выбор промежутка
3. Выбор дня или выбор месяца
4. Возможно указать формат для вывода в инпут (например dd.MM.yyyy)
4. Возможно указать формат для возвращаемых данных (например dd.MM.yyyy)
5. Минимальная и максимальная возможные даты
6. Возможность сделать неактивным
7. Возможность указать максимальную ширину дропдауна с календарем
8. Вкл/Выкл иконки
9. Настройка закрытия при выборе даты


## Установка

```shell
npm i vue3-t-datepicker
```

## Использование

1. Импортируйте стили и компонент в main.ts (.js)
```vue
import { createApp } from 'vue'
import App from './App.vue'

import TDatepicker from 'vue3-t-datepicker'; // Импортируйте компонент
import "vue3-t-datepicker/dist/vue3-t-datepicker.css" // Импортируйте стили

const app = createApp(App);

app.component('TDatepicker', TDatepicker);

app.mount('#app');
```

2. Используйте компонент там, где необходимо:

```vue
<script setup lang="ts">
  import { defineModel } from '@vue/runtime-core'
  const model = defineModel();
</script>
<template>
  <TDatepicker v-model="model"/>
</template>
```

### Props

| **Prop**        | Required | **Description**                                     | **Default** |
|-----------------|----------|-----------------------------------------------------|-------------|
| v-model         | +        | Модель                                              |             |
| textInputFormat | -        | Формат вывода даты в поле ввода                     | dd.MM.yyyy  |
| outputFormat    | -        | Формат возвращаемых данных                          | dd.MM.yyyy  |
| min             | -        | Минимальная дата (должна соответствовать формату)   | undefined   |
| max             | -        | Максимальная дата (должна соответствовать формату)  | undefined   |
| pickerType      | -        | Режим выбора: day - выбор дня, month - выбор месяца | day         |
| range           | -        | Режим выбора промежутка                             | false       |
| disabled        | -        | Отключить datepicker                                | false       |
| maxWidth        | -        | Максимальная ширина дропдауна с календарем          | undefined   |
| clearable       | -        | Отобразить кнопку очистки                           | false       |
| showIcon        | -        | Отобразить иконку календаря                         | false       |
| closeOnSelect   | -        | Закрывать автоматически при выборе даты             | false       |



