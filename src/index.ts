import TDatepicker from '@/components/TDatepicker.vue'
import type { App } from 'vue'

export default TDatepicker;

export function install(app: App) {
  app.component('TDatepicker', TDatepicker);
}
