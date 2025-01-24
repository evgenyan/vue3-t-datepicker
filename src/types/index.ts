/**
 * Datepicker.vue
 */

/**
 * TDatepicker props интерфейс
 */
export interface TDatepickerProps {
  /** Формат вывода в текстовое поле */
  textInputFormat?: string;
  /** Формат возвращаемых */
  outputFormat?: string;
  /** Минимальное значение */
  min?: string;
  /** Максимальное значение */
  max?: string;
  /** Режим работы пикера */
  pickerType?: "day" | "month";
  /** Выбор промежутка */
  range?: boolean;
  /** Выключить пикер */
  disabled?: boolean;
  /** Максимальная ширина дропдауна */
  maxWidth?: number;
  /** Показать кнопку очистки */
  clearable?: boolean;
  /** Показать иконку */
  showIcon?: boolean;
  /** Закрывать при выборе */
  closeOnSelect?: boolean;
}


/**
 * TCalendar.vue
 */

export interface TCalendarProps {
  /** Формат, в котором храним/парсим даты (например, "dd.MM.yyyy") */
  outputFormat: string;
  /** Нижняя граница доступных дат (строка в формате outputFormat) */
  min?: string;
  /** Верхняя граница доступных дат (строка в формате outputFormat) */
  max?: string;
  /** Режим выбора: день или месяц */
  pickerType?: "day" | "month";
  /** Включить выбор диапазона (range) */
  range?: boolean;
  /** Максимальная широта дропдауна с календарем */
  maxWidth?: number;
  /** Закрывать при выборе */
  closeOnSelect?: boolean;
}


/** Интерфейсы для DayItem / MonthItem / YearItem */
export interface DayItem {
  date: Date;
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isOtherMonth: boolean;
  inRange: boolean;
  firstInRange: boolean;
  lastInRange: boolean;
}
export interface MonthItem {
  index: number;
  name: string;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  inRange: boolean;
  firstInRange: boolean;
  lastInRange: boolean;
}
export interface YearItem {
  year: number;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

/**
 * checkMonthSelection return data
 */
export interface CheckMonthSelection {
  isSelected: boolean
  inRange: boolean,
  firstInRange: boolean,
  lastInRange: boolean,
}
