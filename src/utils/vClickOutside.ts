import { type Directive, type DirectiveBinding } from 'vue';

// Определяем тип для обработчика
type ClickOutsideHandler = (event: MouseEvent) => void;

// Расширяем HTMLElement, добавляя кастомное свойство
interface ClickOutsideHTMLElement extends HTMLElement {
  clickOutsideHandler?: ClickOutsideHandler;
}

// Директива
const vClickOutside: Directive<ClickOutsideHTMLElement, ClickOutsideHandler> = {
  beforeMount(el, binding: DirectiveBinding<ClickOutsideHandler>) {
    // Добавляем обработчик клика вне элемента
    el.clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && !(el === target || el.contains(target))) {
        binding.value(event); // Вызываем переданную функцию
      }
    };

    // Добавляем обработчик на документ
    document.addEventListener('click', el.clickOutsideHandler);
  },
  unmounted(el) {
    // Удаляем обработчик, чтобы избежать утечек памяти
    if (el.clickOutsideHandler) {
      document.removeEventListener('click', el.clickOutsideHandler);
    }
  },
};

export default vClickOutside;
