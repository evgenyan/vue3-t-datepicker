import TDatepicker from '@/components/TDatepicker.vue'
import type { App } from 'vue'

export function install(app: App) {
  app.component('TDatepicker', TDatepicker);
}
