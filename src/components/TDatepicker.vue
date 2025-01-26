<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue'
import TCalendar from "@/components/TCalendar.vue";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";
import vClickOutside from "@/utils/vClickOutside";
import "@/assets/datepicker.scss";
import type { TDatepickerProps } from '@/types'
import TDatepickerClearBtn from '@/components/TDatepickerClearBtn.vue'
import TDatepickerIcon from '@/components/icons/TDatepickerIcon.vue'

const {
  textInputFormat = "dd.MM.yyyy",
  outputFormat = "dd.MM.yyyy",
  min,
  max,
  pickerType = "day",
  range = false,
  disabled = false,
  maxWidth = undefined,
  clearable = false,
  showIcon = false,
  closeOnSelect = false
} = defineProps<TDatepickerProps>();

const model = defineModel<string | string[] | null>();
const showCalendar = ref(false);
const calendarStyles = ref<{ top: string; left: string }>({ top: "0px", left: "0px" });
const calendarRef = ref<InstanceType<typeof TCalendar> | null>(null); // Ссылка на компонент TCalendar
const datepickerRef = ref<ComponentPublicInstance | null>(null)
const inputRef = ref<HTMLElement | null>(null); // Ссылка на input

const displayValue = computed(() => {
  if (!model.value) return "";
  if (!range) {
    if (typeof model.value === "string") {
      const parsedDate = parse(model.value, outputFormat, new Date());
      return format(parsedDate, textInputFormat, { locale: ru });
    }
    if (Array.isArray(model.value) && model.value.length) {
      const parsedDate = parse(model.value[0], outputFormat, new Date());
      return format(parsedDate, textInputFormat, { locale: ru });
    }
    return "";
  }
  if (Array.isArray(model.value)) {
    const [startStr, endStr] = model.value;
    if (startStr && endStr) {
      const startDate = parse(startStr, outputFormat, new Date());
      const endDate = parse(endStr, outputFormat, new Date());
      const startFormatted = format(startDate, textInputFormat, { locale: ru });
      const endFormatted = format(endDate, textInputFormat, { locale: ru });
      return `${startFormatted} - ${endFormatted}`;
    } else if (startStr) {
      const startDate = parse(startStr, outputFormat, new Date());
      return format(startDate, textInputFormat, { locale: ru });
    }
    return "";
  } else if (typeof model.value === "string") {
    const parsedDate = parse(model.value, outputFormat, new Date());
    return format(parsedDate, textInputFormat, { locale: ru });
  } else {
    return "";
  }
});

const placeholder = computed(() => {
  return range ? "Выберите период" : "Выберите дату";
});

/**
 * Вычисляет положение календаря, чтобы он оставался в видимой области экрана
 */
const calculatePosition = () => {
  if(!calendarRef.value || !inputRef.value) return;
  const inputRect = inputRef.value.getBoundingClientRect();
  const calendarRect = calendarRef.value.$el.getBoundingClientRect();
  let top = inputRect.height;
  let left = 0
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if((inputRect.left + calendarRect.width) > viewportWidth){
    left = 0 - ((inputRect.left + calendarRect.width) - viewportWidth);
  }
  if((inputRect.bottom + calendarRect.height) > viewportHeight){
    top = 0 - ((calendarRect.height));
  }
  // Обновляем стили
  calendarStyles.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

/**
 * Открывает календарь и рассчитывает его позицию
 */
const openCalendar = async () => {
  if (disabled){
    return
  }
  showCalendar.value = true;
  await nextTick(); // Ждём, чтобы DOM обновился
  calculatePosition();
};

// Добавляем обработчик resize
onMounted(() => {
  window.addEventListener("resize", calculatePosition);
});

// Удаляем обработчик resize при уничтожении компонента
onUnmounted(() => {
  window.removeEventListener("resize", calculatePosition);
});

const canClear = computed(()=>{
  return clearable && displayValue.value
})


</script>

<template>
  <div
    ref="datepickerRef"
    v-click-outside="() => (showCalendar = false)"
    class="t-datepicker"
    :class="{'t-datepicker__disabled': disabled}"
  >
    <!-- Инпут -->
    <div
      ref="inputRef"
      class="t-datepicker__input-wrapper"
      @focus="openCalendar"
      @click="openCalendar"
    >
      <div
        v-if="showIcon"
        class="t-datepicker__icon"
      >
        <TDatepickerIcon />
      </div>
      <input
        type="text"
        :placeholder="placeholder"
        :value="displayValue"
        :disabled="disabled"
        readonly
        @focus="openCalendar"
        @click="openCalendar"
      >
      <div
        v-if="canClear"
        class="t-datepicker__clear-btn"
        @click.stop="model = null"
      >
        <TDatepickerClearBtn />
      </div>
    </div>
    <!-- Календарь -->
    <Transition>
      <TCalendar
        v-if="showCalendar"
        ref="calendarRef"
        v-model="model"
        :output-format="outputFormat"
        :min="min"
        :max="max"
        :picker-type="pickerType"
        :range="range"
        :style="[calendarStyles]"
        :max-width="maxWidth"
        :close-on-select="closeOnSelect"
        @close="showCalendar = false"
      />
    </Transition>
  </div>
</template>
