import { ref } from 'vue';

export const favorite = ref({
    proglists: [], 
    favorlists: [],
    recentlists: [],
    reset() { this.proglists = []; this.favorlists = []; this.recentlists = []; },
    setProgLists(value) { this.proglists = value; },
    setFavorLists(value) { this.favorlists = value; },
    setRecentLists(value) { this.recentlists = value; },
});
