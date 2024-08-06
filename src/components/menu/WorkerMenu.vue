<template>
      <div id="page_first" class="pt-page" :class="visible ? 'pt-page-current pt-page-moveFromRight' : 'pt-page-moveToRightFade'">
        <div id="page_first_sub" class="panel-body pt-page-body" align="center">
          <div class="favor-navbox-tiles">
            <template v-for="(item,index) in favorite.favorlists" :key="index">
                <a v-if="item.type != 'new'" href="javascript:void(0)" @click.stop="openAppClick(item)" class="tile fa-box-title fav-app fa-link-app" :data-pid="item.programid" :data-url="item.url" :title="item.programid"><div class="icon"><img class="fa fa-app-image" :src="getAppIcon(item)" alt=""/></div><span class="title">{{ getDisplayAppName(item) }}</span></a>
            </template>
          </div>
        </div>
      </div>
</template>
<script>
import { onActivated } from 'vue';
import { getImgUrl } from "@willsofts/will-app";
import { openPage } from "@/assets/js/login.util.js";
import { accessor } from "@/assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";

export default {
  props: {
    visible: {
      type: [String,Boolean],
      default: false,
    },
    animate: {
      type: [String,Boolean],
      default: true,
    },
  },
  setup(props,context) {
    const onactivated = onActivated(() => {
      console.log("WorkerMenu.vue: onActivated ... ");
      context.emit("activated","menu");
    });
    return { accessor, favorite, onactivated };
  },
  mounted() {
    console.log("WorkerMenu.vue mounted ...");
  },
  methods: {
    getAppIcon(item) {
        return item.iconfile && item.iconfile.trim().length > 0 ? getImgUrl()+"/img/apps/"+item.iconfile : this.getDefaultAppIcon();
    },
    getDefaultAppIcon() {
        return getImgUrl()+"/img/apps/application.png";
    },
    getDisplayAppName(item) {
        return this.accessor.lang === 'EN' ? item.shortname : item.shortnameth;
    },
    openAppClick(item) {
      openPage(item,this.accessor,this.favorite);
    },
  },
};
</script>
