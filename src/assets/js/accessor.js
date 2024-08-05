import { ref } from 'vue';
import { getDefaultLanguage } from './app.info';

export const accessor = ref({
    lang: getDefaultLanguage(),
    info: {},
    reset() { this.info = {}; },
    setInfo(value) { this.info = {...value}; },
});
