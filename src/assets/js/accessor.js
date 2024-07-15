import { ref } from 'vue';
import { getDefaultLanguage } from './appinfo';

export const accessor = ref({
    lang: getDefaultLanguage(),
    info: {},
    reset() { this.info = {}; },
    setInfo(value) { this.info = {...value}; },
});
