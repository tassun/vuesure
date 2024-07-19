import { ref } from 'vue';

export const policies = ref({
    categories: {},
    reset() { this.categories = {}; },
    isEmpty() { return Object.keys(this.categories).length == 0; },
    setCategories(value) { this.categories = value; },
    getCategory(key) { return this.categories[key]; },
});
