<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { format, parse, isSameDay, isAfter } from "date-fns";
import { ru } from "date-fns/locale";
import { type CheckMonthSelection, type DayItem, type MonthItem, type TCalendarProps, type YearItem } from '@/types'
import "@/assets/calendar.scss"
import TDatepickerArrowIcon from '@/components/icons/TDatepickerArrowIcon.vue'

/**
 * Пропсы, получаемые из родителя
 */
const props = defineProps<TCalendarProps>();

/**
 * События:
 * - selectDate (происходит при выборе даты)
 * - close (нажата кнопка «Закрыть»)
 */
const emit = defineEmits(['close']);

/**
 * Модель (v-model). Может быть:
 * - null (нет выбора)
 * - string (одна дата)
 * - string[] (две даты при range=true)
 */
const model = defineModel<string | string[] | null>();

/**
 * Преобразовать строку в формате outputFormat в Date или null
 * @param value Строка, представляющая дату
 * @param fmt Формат дат
 */
function parseOrNull(value: string | undefined, fmt: string): Date | null {
  return value ? parse(value, fmt, new Date()) : null;
}

/** minDate / maxDate, если заданы */
const minDate = computed(() => parseOrNull(props.min, props.outputFormat));
const maxDate = computed(() => parseOrNull(props.max, props.outputFormat));

/** Тип пикера: 'day' (по умолчанию) или 'month' */
const pickerType = computed(() => props.pickerType ?? "day");
/** Включен ли режим выбора диапазона */
const range = computed(() => props.range === true);

/* --------------------------------------------------------------------
   В режиме «day» есть подрежим subMode:
     - 'day'   (сетка дней)
     - 'month' (сетка месяцев)
     - 'year'  (сетка годов)
-------------------------------------------------------------------- */
const subMode = ref<"day" | "month" | "year">("day");

/**
 * Переключиться в подрежим "day" (отображать сетку дней)
 */
function setDayMode(): void {
  subMode.value = "day";
}

/**
 * Переключиться в подрежим "month" (выбор месяца)
 */
function setMonthMode(): void {
  subMode.value = "month";
}

/**
 * Переключиться в подрежим "year" (список годов)
 */
function setYearMode(): void {
  subMode.value = "year";
}

/* --------------------------------------------------------------------
   В режиме «month» есть подрежим monthSubMode:
     - 'month' (сетка месяцев)
     - 'year'  (список годов)
-------------------------------------------------------------------- */
const monthSubMode = ref<"month" | "year">("month");

/**
 * Переключиться в monthSubMode="month"
 */
function setMonthSubMode(): void {
  monthSubMode.value = "month";
}

/**
 * Переключиться в monthSubMode="year"
 */
function setYearSubMode(): void {
  monthSubMode.value = "year";
}

/* --------------------------------------------------------------------
   Текущее состояние календаря: currentDate (Date)
   От него берём currentYear / currentMonth
-------------------------------------------------------------------- */
const currentDate = ref<Date>(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

/** Массив названий месяцев */
const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

/**
 * Форматировать Date в строку по props.outputFormat
 */
function formatDate(date: Date): string {
  return format(date, props.outputFormat, { locale: ru });
}

/**
 * Проверка, не выходит ли дата за рамки minDate / maxDate
 */
function isDisabled(date: Date): boolean {
  if (minDate.value && date < minDate.value) return true;
  if (maxDate.value && date > maxDate.value) return true;
  return false;
}

/* --------------------------------------------------------------------
   Локальное хранение "первой даты" (firstPickedDate) для range
-------------------------------------------------------------------- */
const firstPickedDate = ref<Date | null>(null);

/**
 * Обработчик клика по дню или месяцу
 * @param clickedDate Дата, на которую кликнули
 */
function handleClickDate(clickedDate: Date): void {
  // Если range=false => выбираем одну дату
  if (!range.value) {
    model.value = formatDate(clickedDate);
    if(props.closeOnSelect){
      emit('close');
    }
    return;
  }

  // range=true
  // Если уже две даты => сброс (начинаем заново)
  if (Array.isArray(model.value) && model.value.length === 2) {
    model.value = null;
    firstPickedDate.value = null;
  }

  // Если нет первой даты => это первый клик
  if (firstPickedDate.value === null) {
    firstPickedDate.value = clickedDate;
    model.value = [formatDate(clickedDate)]; // для подсветки первого клика
    return;
  }

  // Иначе это второй клик => формируем диапазон
  let start = firstPickedDate.value;
  let end = clickedDate;
  if (isAfter(start, end)) {
    [start, end] = [end, start];
  }
  model.value = [formatDate(start), formatDate(end)];
  firstPickedDate.value = null;
  if(props.closeOnSelect){
    emit('close');
  }
}

/* --------------------------------------------------------------------
   rangeStart / rangeEnd - вычислимые границы диапазона
-------------------------------------------------------------------- */
const rangeStart = computed<Date | null>(() => {
  if (!range.value || !Array.isArray(model.value) || model.value.length < 2) {
    return null;
  }
  return parse(model.value[0], props.outputFormat, new Date());
});
const rangeEnd = computed<Date | null>(() => {
  if (!range.value || !Array.isArray(model.value) || model.value.length < 2) {
    return null;
  }
  return parse(model.value[1], props.outputFormat, new Date());
});

/**
 * Проверка, попадает ли дата внутрь [rangeStart..rangeEnd]
 */
function isInRange(date: Date): boolean {
  if (!rangeStart.value || !rangeEnd.value) return false;
  return !(date < rangeStart.value || date > rangeEnd.value);
}
function isFirstInRange(date: Date): boolean {
  if (!rangeStart.value || !rangeEnd.value) return false;
  return isSameDay(date, rangeStart.value);
}
function isLastInRange(date: Date): boolean {
  if (!rangeStart.value || !rangeEnd.value) return false;
  return isSameDay(date, rangeEnd.value);
}

/* --------------------------------------------------------------------
   prevPeriod / nextPeriod - переключение месяцев / лет (+12) и т. д.
-------------------------------------------------------------------- */
/**
 * Переключиться на следующий период
 */
function nextPeriod(): void {
  if (pickerType.value === "day") {
    switch (subMode.value) {
      case "day":
        // +1 месяц
        currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
        break;
      case "month":
        // +1 год
        currentDate.value = new Date(currentYear.value + 1, currentMonth.value, 1);
        break;
      case "year":
        // +12 лет
        currentDate.value = new Date(currentYear.value + 12, currentMonth.value, 1);
        break;
    }
  } else {
    // pickerType="month"
    switch (monthSubMode.value) {
      case "month":
        currentDate.value = new Date(currentYear.value + 1, currentMonth.value, 1);
        break;
      case "year":
        currentDate.value = new Date(currentYear.value + 12, currentMonth.value, 1);
        break;
    }
  }
}

/**
 * Переключиться на предыдущий период
 */
function prevPeriod(): void {
  if (pickerType.value === "day") {
    switch (subMode.value) {
      case "day":
        currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
        break;
      case "month":
        currentDate.value = new Date(currentYear.value - 1, currentMonth.value, 1);
        break;
      case "year":
        currentDate.value = new Date(currentYear.value - 12, currentMonth.value, 1);
        break;
    }
  } else {
    // pickerType="month"
    switch (monthSubMode.value) {
      case "month":
        currentDate.value = new Date(currentYear.value - 1, currentMonth.value, 1);
        break;
      case "year":
        currentDate.value = new Date(currentYear.value - 12, currentMonth.value, 1);
        break;
    }
  }
}

/* --------------------------------------------------------------------
   pickerType="day" + subMode="day" => календарь дней
-------------------------------------------------------------------- */
const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Массив DayItem для отображения календаря
 */
const days = computed<DayItem[]>(() => {
  if (pickerType.value !== "day" || subMode.value !== "day") return [];

  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const lastWeekday = (lastDayOfMonth.getDay() + 6) % 7;

  const result: DayItem[] = [];

  // "хвост" предыдущего месяца
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value, -i);
    result.push(createDayItem(date, true));
  }
  // текущий месяц
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    result.push(createDayItem(date, false));
  }
  // "хвост" следующего месяца
  const daysToAdd = 6 - lastWeekday;
  for (let i = 1; i <= daysToAdd; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    result.push(createDayItem(date, true));
  }

  return result;
});

/**
 * Создание объекта DayItem
 */
function createDayItem(date: Date, isOtherMonth: boolean): DayItem {
  return {
    date,
    day: date.getDate(),
    isToday: isSameDay(date, new Date()),
    isSelected: isSelectedDay(date),
    isDisabled: isDisabled(date),
    isOtherMonth,
    inRange: isInRange(date),
    firstInRange: isFirstInRange(date),
    lastInRange: isLastInRange(date),
  };
}

/**
 * Проверка, выбран ли конкретный день
 */
function isSelectedDay(date: Date): boolean {
  if (!model.value) return false;
  if (!range.value) {
    // одиночная дата (string)
    if (typeof model.value === "string") {
      const parsed = parse(model.value, props.outputFormat, new Date());
      return isSameDay(date, parsed);
    }
    return false;
  } else {
    // range=true => массив
    if (Array.isArray(model.value)) {
      if (model.value.length === 1) {
        const single = parse(model.value[0], props.outputFormat, new Date());
        return isSameDay(date, single);
      } else if (model.value.length === 2) {
        const start = parse(model.value[0], props.outputFormat, new Date());
        const end = parse(model.value[1], props.outputFormat, new Date());
        return isSameDay(date, start) || isSameDay(date, end);
      }
    }
    return false;
  }
}

/**
 * Клик по дню
 */
function selectDay(date: Date): void {
  if (isDisabled(date)) return;
  handleClickDate(date);
}

/* --------------------------------------------------------------------
   pickerType="day" + subMode="month" => переключение месяца
-------------------------------------------------------------------- */
const monthsListDay = computed<MonthItem[]>(() => {
  if (pickerType.value !== "day" || subMode.value !== "month") return [];
  const arr: MonthItem[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const testDate = new Date(currentYear.value, i, 1);
    arr.push({
      index: i,
      name: monthNames[i],
      isToday:
                testDate.getFullYear() === now.getFullYear() &&
                testDate.getMonth() === now.getMonth(),
      isSelected: i === currentMonth.value,
      isDisabled: isDisabled(testDate),
      inRange: false,
      firstInRange: false,
      lastInRange: false,
    });
  }
  return arr;
});

/**
 * Выбор месяца в subMode="month" (day-режим)
 */
function selectMonthInDayMode(monthIndex: number): void {
  const newDate = new Date(currentYear.value, monthIndex, 1);
  if (isDisabled(newDate)) return;
  currentDate.value = newDate;
  subMode.value = "day";
}

/* --------------------------------------------------------------------
   pickerType="day" + subMode="year" => список годов
-------------------------------------------------------------------- */
const yearsRange = { start: 1900, end: 2100 };

const yearsListDay = computed<YearItem[]>(() => {
  if (pickerType.value !== "day" || subMode.value !== "year") return [];
  const arr: YearItem[] = [];
  const nowYear = new Date().getFullYear();
  for (let y = yearsRange.start; y <= yearsRange.end; y++) {
    const testDate = new Date(y, currentMonth.value, 1);
    arr.push({
      year: y,
      isToday: y === nowYear,
      isSelected: y === currentYear.value,
      isDisabled: isDisabled(testDate),
    });
  }
  return arr;
});

/**
 * Выбор года в subMode="year" (day-режим)
 */
function selectYearInDayMode(year: number): void {
  const newDate = new Date(year, currentMonth.value, 1);
  if (isDisabled(newDate)) return;
  currentDate.value = newDate;
  subMode.value = "day";
}

/* --------------------------------------------------------------------
   pickerType="month" + monthSubMode="month" / "year"
-------------------------------------------------------------------- */
const monthsListMonth = computed<MonthItem[]>(() => {
  if (pickerType.value !== "month" || monthSubMode.value !== "month") return [];
  const arr: MonthItem[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const testDate = new Date(currentYear.value, i, 1);
    const isTod =
            testDate.getFullYear() === now.getFullYear() &&
            testDate.getMonth() === now.getMonth();
    const { isSelected, inRange, firstInRange, lastInRange } = checkMonthSelection(testDate);
    arr.push({
      index: i,
      name: monthNames[i],
      isToday: isTod,
      isSelected,
      isDisabled: isDisabled(testDate),
      inRange,
      firstInRange,
      lastInRange,
    });
  }
  return arr;
});

/**
 * Определить, выбран ли месяц, а также inRange / firstInRange / lastInRange
 */

function checkMonthSelection(dateOfMonth: Date): CheckMonthSelection {
  let isSelected = false;
  let inRangeVal = false;
  let firstInR = false;
  let lastInR = false;

  if (!model.value) {
    return { isSelected, inRange: inRangeVal, firstInRange: firstInR, lastInRange: lastInR };
  }
  const y = dateOfMonth.getFullYear();
  const m = dateOfMonth.getMonth();

  // Одиночный выбор
  if (!range.value) {
    if (typeof model.value === "string") {
      const p = parse(model.value, props.outputFormat, new Date());
      if (p.getFullYear() === y && p.getMonth() === m) {
        isSelected = true;
      }
    }
    return { isSelected, inRange: inRangeVal, firstInRange: firstInR, lastInRange: lastInR };
  }

  // range=true => массив
  if (Array.isArray(model.value)) {
    if (model.value.length === 1) {
      // Первый клик
      const single = parse(model.value[0], props.outputFormat, new Date());
      if (single.getFullYear() === y && single.getMonth() === m) {
        isSelected = true;
      }
    } else if (model.value.length === 2) {
      const start = parse(model.value[0], props.outputFormat, new Date());
      const end = parse(model.value[1], props.outputFormat, new Date());
      if (start.getFullYear() === y && start.getMonth() === m) {
        isSelected = true;
        firstInR = true;
      }
      if (end.getFullYear() === y && end.getMonth() === m) {
        isSelected = true;
        lastInR = true;
      }
      const thisTime = dateOfMonth.getTime();
      if (thisTime >= start.getTime() && thisTime <= end.getTime()) {
        inRangeVal = true;
      }
    }
  }
  return {
    isSelected,
    inRange: inRangeVal,
    firstInRange: firstInR,
    lastInRange: lastInR,
  };
}

/**
 * Клик по месяцу в режиме pickerType="month" + monthSubMode="month"
 */
function selectMonthInMonthMode(monthIndex: number): void {
  const dateOfMonth = new Date(currentYear.value, monthIndex, 1);
  if (isDisabled(dateOfMonth)) return;
  if (!range.value) {
    model.value = formatDate(dateOfMonth);

    return;
  }
  handleClickDate(dateOfMonth);
}

/* --------------------------------------------------------------------
   pickerType="month" + monthSubMode="year" => список годов
-------------------------------------------------------------------- */
const yearsListMonth = computed<YearItem[]>(() => {
  if (pickerType.value !== "month" || monthSubMode.value !== "year") return [];
  const arr: YearItem[] = [];
  const nowYear = new Date().getFullYear();
  for (let y = yearsRange.start; y <= yearsRange.end; y++) {
    const testDate = new Date(y, currentMonth.value, 1);
    arr.push({
      year: y,
      isToday: y === nowYear,
      isSelected: y === currentYear.value,
      isDisabled: isDisabled(testDate),
    });
  }
  return arr;
});

/**
 * Клик по году в режиме pickerType="month" + monthSubMode="year"
 */
function selectYearInMonthMode(year: number): void {
  const newDate = new Date(year, currentMonth.value, 1);
  if (isDisabled(newDate)) return;
  currentDate.value = newDate;
  monthSubMode.value = "month";
}

/* --------------------------------------------------------------------
   АВТОПРОКРУТКА К ВЫБРАННОМУ ГОДУ (watch на subMode / monthSubMode)
   - 5 столбцов в сетке, прокрутка только вертикальная.
-------------------------------------------------------------------- */

/**
 * При переключении subMode => если subMode="year" и pickerType="day",
 * после рендера скроллим к выбранному году.
 */
watch(
  () => subMode.value,
  async (newVal) => {
    if (pickerType.value === "day" && newVal === "year") {
      await nextTick();
      scrollToSelectedYear("day");
    }
  }
);

/**
 * При переключении monthSubMode => если monthSubMode="year" и pickerType="month",
 * после рендера скроллим к выбранному году.
 */
watch(
  () => monthSubMode.value,
  async (newVal) => {
    if (pickerType.value === "month" && newVal === "year") {
      await nextTick();
      scrollToSelectedYear("month");
    }
  }
);

/**
 * Прокрутить к текущему (или выбранному) году по id
 * @param mode "day" или "month"
 */
function scrollToSelectedYear(mode: "day" | "month") {
  // Используем currentYear.value как «выбранный» год
  const selYear = currentYear.value;
  const id = `year-${mode}-${selYear}`;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ block: "center", inline: "center" });
  }
}

const calendarStyles = computed(()=>{
  let styles = '';
  if(props.maxWidth){
    styles = styles + `max-width: ${props.maxWidth}px !important;`
  }
  return styles;
})
</script>

<template>
  <div
    class="t-datepicker-calendar"
    :style="calendarStyles"
  >
    <!-- Шапка: переключение subMode (day/month/year) или monthSubMode (month/year) -->
    <div class="t-datepicker-calendar__header">
      <button
        class="t-datepicker-calendar__arrow-left"
        @click="prevPeriod"
      >
        <TDatepickerArrowIcon />
      </button>

      <!-- Если pickerType="day", показываем subMode -->
      <template v-if="pickerType === 'day'">
        <!-- day-режим, subMode=day => показываем "Месяц" + "Год" -->
        <span
          v-if="subMode === 'day'"
          class="t-datepicker-calendar__clickable"
          @click.stop="setMonthMode"
        >
          {{ monthNames[currentMonth] }}
        </span>
        <span v-if="subMode === 'day'" />
        <span
          v-if="subMode === 'day'"
          class="t-datepicker-calendar__clickable"
          @click.stop="setYearMode"
        >
          {{ currentYear }}
        </span>

        <!-- subMode=month => показываем "Год" (клик => вернуть в day) -->
        <span
          v-else-if="subMode === 'month'"
          class="t-datepicker-calendar__clickable"
          @click.stop="setDayMode"
        >
          {{ currentYear }}
        </span>

        <!-- subMode=year => показываем "Год" (клик => вернуть в day) -->
        <span
          v-else-if="subMode === 'year'"
          class="t-datepicker-calendar__clickable"
          @click.stop="setDayMode"
        >
          {{ currentYear }}
        </span>
      </template>

      <!-- Если pickerType="month", показываем monthSubMode -->
      <template v-else>
        <!-- monthSubMode=month => показываем год, клик => year -->
        <span
          v-if="monthSubMode === 'month'"
          class="t-datepicker-calendar__clickable"
          @click.stop="setYearSubMode"
        >
          {{ currentYear }}
        </span>
        <!-- monthSubMode=year => показываем год, клик => month -->
        <span
          v-else
          class="t-datepicker-calendar__clickable"
          @click.stop="setMonthSubMode"
        >
          {{ currentYear }}
        </span>
      </template>

      <button
        class="t-datepicker-calendar__arrow-right"
        @click="nextPeriod"
      >
        <TDatepickerArrowIcon class="rotate-180" />
      </button>
    </div>

    <!-- 1) DAY + subMode=day => сетка дней -->
    <template v-if="pickerType === 'day' && subMode === 'day'">
      <div class="t-datepicker-calendar__weekdays">
        <span
          v-for="w in weekdays"
          :key="w"
          class="t-datepicker-calendar__weekday"
        >
          {{ w }}
        </span>
      </div>
      <div class="t-datepicker-calendar__days">
        <span
          v-for="dayItem in days"
          :key="dayItem.date.getTime()"
          :class="[
            't-datepicker-calendar__day',
            {
              't-datepicker-calendar__today': dayItem.isToday,
              't-datepicker-calendar__selected': dayItem.isSelected,
              't-datepicker-calendar__other-month': dayItem.isOtherMonth,
              't-datepicker-calendar__disabled-day': dayItem.isDisabled,
              't-datepicker-calendar__in-range': dayItem.inRange,
              't-datepicker-calendar__first-in-range': dayItem.firstInRange,
              't-datepicker-calendar__last-in-range': dayItem.lastInRange
            }
          ]"
          @click.stop="selectDay(dayItem.date)"
        >
          {{ dayItem.day }}
        </span>
      </div>
    </template>

    <!-- 2) DAY + subMode=month => выбор месяца (просто переключаем currentDate) -->
    <template v-else-if="pickerType === 'day' && subMode === 'month'">
      <div class="t-datepicker-calendar__months-grid">
        <div
          v-for="mItem in monthsListDay"
          :key="mItem.index"
          :class="[
            't-datepicker-calendar__month-cell',
            {
              't-datepicker-calendar__selected': mItem.isSelected,
              't-datepicker-calendar__today-month': mItem.isToday,
              't-datepicker-calendar__disabled-day': mItem.isDisabled
            }
          ]"
          @click.stop="selectMonthInDayMode(mItem.index)"
        >
          {{ mItem.name }}
        </div>
      </div>
    </template>

    <!-- 3) DAY + subMode=year => сетка годов (1900..2100) -->
    <template v-else-if="pickerType === 'day' && subMode === 'year'">
      <div class="t-datepicker-calendar__years-grid">
        <div
          v-for="yItem in yearsListDay"
          :id="'year-day-' + yItem.year"
          :key="yItem.year"
          :class="[
            't-datepicker-calendar__year-cell',
            {
              't-datepicker-calendar__selected': yItem.isSelected,
              't-datepicker-calendar__today-year': yItem.isToday,
              't-datepicker-calendar__disabled-day': yItem.isDisabled
            }
          ]"
          @click.stop="selectYearInDayMode(yItem.year)"
        >
          {{ yItem.year }}
        </div>
      </div>
    </template>

    <!-- 4) MONTH + monthSubMode=month => выбор месяца (одиночный или диапазон) -->
    <template v-else-if="pickerType === 'month' && monthSubMode === 'month'">
      <div class="months-grid">
        <div
          v-for="mItem in monthsListMonth"
          :key="mItem.index"
          :class="[
            'month-cell',
            {
              selected: mItem.isSelected,
              'today-month': mItem.isToday,
              'disabled-day': mItem.isDisabled,
              'in-range': mItem.inRange,
              'first-in-range': mItem.firstInRange,
              'last-in-range': mItem.lastInRange
            }
          ]"
          @click.stop="selectMonthInMonthMode(mItem.index)"
        >
          {{ mItem.name }}
        </div>
      </div>
    </template>

    <!-- 5) MONTH + monthSubMode=year => сетка годов -->
    <template v-else-if="pickerType === 'month' && monthSubMode === 'year'">
      <div class="years-grid">
        <div
          v-for="yItem in yearsListMonth"
          :id="'year-month-' + yItem.year"
          :key="yItem.year"
          :class="[
            'year-cell',
            {
              selected: yItem.isSelected,
              'today-year': yItem.isToday,
              'disabled-day': yItem.isDisabled
            }
          ]"
          @click.stop="selectYearInMonthMode(yItem.year)"
        >
          {{ yItem.year }}
        </div>
      </div>
    </template>
  </div>
</template>
