<template>
    <ul id="recentmenulist" class="dropdown-menu" aria-labelledby="navbarDropdown">
        <li v-for="(item,index) in favorite.recentlists" :key="index">
            <a href='javascript:void(0)' @click="openAppClick(item)" class="dropdown-item">{{ getDisplayRecentName(item) }}</a>
        </li>
    </ul>
</template>
<script>
import { accessor } from "@/assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";
import { openPage } from "@/assets/js/login.util.js";

export default {
  setup() {
    return { accessor, favorite };
  },
  methods: {
    getDisplayRecentName(item) {
        return this.accessor.lang === 'EN' ? item.progname : item.prognameth;
    },
    openAppClick(item) {
      openPage(item,this.accessor,this.favorite);
      this.$root.hideMeu();
    },
  },
};
</script>
