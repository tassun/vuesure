import { ref } from 'vue';
import { getDefaultLanguage } from '@willsofts/will-app';

export const accessor = ref({
    lang: getDefaultLanguage(),
    info: {},
    reset() { this.info = {}; },
    setInfo(value) { this.info = {...value}; },
});
