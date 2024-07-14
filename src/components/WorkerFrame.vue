<template>
  <div id="fsworkinglayer" class="working-class working-control-class">
    <div id="pagecontainer" class="pt-pager" v-show="pageVisible">
      <div id="page_first" class="pt-page pt-page-current" v-show="pageVisible">
        <div id="page_first_sub" class="panel-body pt-page-body" align="center">
          <div class="favor-navbox-tiles">
            <a v-for="(item,index) in applists" :key="index" href="javascript:void(0)" @click.stop="openAppClick(item)" class="tile fa-box-title fav-app fa-link-app" :data-pid="item.programid" :data-url="item.url" :title="item.programid"><div class="icon"><img class="fa fa-app-image" :src="getAppIcon(item)" alt=""/></div><span class="title">{{ getDisplayAppName(item) }}</span></a>
          </div>
        </div>
      </div>    
    </div> 
    <iframe id="workingframe" name="workingframe" width="100%" class="working-frame" title="Working" v-show="visible"></iframe>
  </div> 
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { getApiUrl, getImgUrl, DEFAULT_CONTENT_TYPE } from "@/assets/js/appinfo";
import { stopWaiting }  from '@/assets/js/apputil.js';
import { getAccessorToken } from "@/assets/js/messenger";
import { refreshScreen, openPage } from "@/assets/js/menuutil";
import { accessor } from "@/assets/js/accessor.js";

export default {
  props: {
    visible: {
      type: [String,Boolean],
      default: false,
    },
  },
  setup() {
    const applists = ref([]);
    const pageVisible = ref(false);
    return { accessor, applists, pageVisible };
  },
  mounted() {
    this.$nextTick(() => {
        $("#workingframe").on("load",function() { stopWaiting(); refreshScreen(); });
        $(window).on("resize",function() { 
            let wh = $(window).height();
            let nh = 0;
            if($("#navigatebar").is(":visible")) {
                nh = $("#navigatebar").height();
            }
            $("#workingframe").height((wh-nh) - 30);
        }).trigger("resize");
    });
  },
  methods: {
    reset() {
        console.log("WorkerFrame.vue: reset ...");
        this.applists = [];
        this.pageVisible = false;
    },
    setting() {
        this.loadPageFirst();
    },
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
      console.log("WorkerFrame.vue: open app click",item);
      openPage(item.programid,item.url);
    },
    loadPageFirst() {
      let access_user = this.accessor.info?.userid;
      if(!access_user || access_user.trim().length==0) return;
      let authtoken = getAccessorToken();
      $.ajax({
        url: getApiUrl()+"/api/menu/box",
        type: "POST",
        data: { userid: access_user },
        headers : { "authtoken": authtoken },
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        success: (data,status,transport) => { 
          console.log("WorkerFrame.vue: loadPageFirst success",transport.responseText);                
          if(data.body.dataset) {
            this.applists = data.body.dataset.rows;
            this.pageVisible = true;
          }
        },
      });	
    },
  },
};
</script>
