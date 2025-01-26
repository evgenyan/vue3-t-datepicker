<script setup lang="ts">
import {ref} from "vue";
import TDatepicker from '@/components/TDatepicker.vue'
const date = ref<string|null>(null)
</script>

<template>
  <main>
    <div style="padding: 10px">
      <TDatepicker
        v-model="date"
        output-format="dd.MM.yyyy"
        text-input-format="dd.MM.yyyy"
        picker-type="day"
        range
        clearable
        show-icon
        close-on-select
      />
    </div>
  </main>
</template>

<style scoped>
main {
  background-color: #f5f5f5;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
