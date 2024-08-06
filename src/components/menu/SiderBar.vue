<template>
	<nav ref="sidebarmenu" id="sidebarmenu" class="sidebar sidebar-menu main navbar-expand" :class="menuFlip ? 'fliph' : 'unfliph'" v-show="visible">
    <div id="sidebarheader" class="sidebar-header" v-show="searchingVisible">
      <div class="input-group-search has-search">
        <span id="searchspan" class="fa fa-search form-control-search" aria-hidden="true"></span>
        <input ref="sidemenusearchtext" type="text" id="sidemenusearchtext" class="form-control form-control-input-search input-md" placeholder="Search" />
      </div>
    </div>
    <div ref="sidebarlayer" id="sidebarlayer" class="sidebar-layer sidebar left">
      <SiderMenu ref="siderMenu" :lang="accessor.lang" :menus="menuItems" @item-menu-selected="itemMenuSelected" @group-menu-selected="groupMenuSelected" />
    </div>
  </nav>
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { getApiUrl, DEFAULT_CONTENT_TYPE } from "@willsofts/will-app";
import { serializeParameters } from "@willsofts/will-app";
import { openPage } from "@/assets/js/login.util.js";
import { accessor } from "@/assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";
import SiderMenu from "./SiderMenu.vue";

const menuData = {sidemap: {}, sidelist: {}};

export default {
  components: { SiderMenu },
  props: {
    labels: Object,    
    visible: {
      type: [String,Boolean],
      default: true,
    },
  },
  setup() {
    const menuItems = ref(menuData);
    const searchingVisible = ref(false);
    const menuFlip = ref(true);
    return { accessor, favorite, menuItems, searchingVisible, menuFlip };
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize();
    });
  },
  methods: {
    reset() {
      console.log("SiderBar.vue: reset ...");
      this.menuItems = {...menuData};
    },
    initialize() {
      console.log("SiderBar: initialize ...");
			$(document).on("click",(e) => { 
				let $target = $(e.target);
				if (!$target.closest('#sidebarmenu').length && !$target.closest('#mainmenutrigger').length) {
          this.collapseSideBarMenu();
				}
			});	
			$("#sidemenusearchtext").autocomplete({
        delay: 500, //delay keystroke to be search from server
				select : (event, ui) => {
					console.log("side menu search selected",JSON.stringify(ui.item));
          this.itemMenuSelected(ui.item.element);
				}
			});
    },
    displaySideBarMenu() {
      this.menuFlip = !this.menuFlip;
      this.searchingVisible = !this.searchingVisible;
    },
    collapseSideBarMenu() {
      this.searchingVisible = false;
      this.menuFlip = true;
    },
    setting(callback) {
      console.log("SideBar: setting",this.accessor);
      this.loadSideBarMenu(callback);
    },
    show() {
      this.searchingVisible = false;
      this.menuFlip = true;
    },
    changeLanguage(lang) {
      console.log("SiderBar.vue: language changed",lang);
      this.initSearching(lang);
    },
    initSearching(lang) {
      let jsAry = Object.values(this.menuItems.sidelist).flat().map((item) => { return {
        label : lang=="EN"?item.progname:item.prognameth, element : item
      }});
      $("#sidemenusearchtext").autocomplete("option","source",jsAry);
      return jsAry;
    },
    initMenuItems(dataset) {
      if(!dataset) return;
      let sidelist = {};
      //try to remove plugin program (progtype=I)
      for(let p in dataset.sidelist) {
        let ary = dataset.sidelist[p];
        let items = ary.filter((item) => item.progtype!='I');
        if(items.length == 0) {
        let it = dataset.sidemap[p];
        if(it) items = [it];
        }
        sidelist[p] = items;
      }
      this.menuItems = {sidemap: dataset.sidemap, sidelist: sidelist };
      console.log("initMenuItems: menu items",this.menuItems);
    },
    itemMenuSelected(item) {
      console.log("SiderBar.vue: item-menu-selected",item);
      openPage(item,this.accessor,this.favorite);
      this.collapseSideBarMenu();
    },
    groupMenuSelected(group) {
      console.log("SideBar.vue: grup-menu-selected",group);
      if(this.menuFlip) {
        this.displaySideBarMenu();
      }
    },
    loadSideBarMenu(callback) {
      console.log("loadSideBarMenu: accessor",this.accessor);
      let access_user = this.accessor.info?.userid;
      if(!access_user || access_user.trim().length==0) return;
      let language = this.accessor.lang;
      let params = { userid: access_user, language: language };
      let formdata = serializeParameters(params);
      $.ajax({
        url: getApiUrl()+"/api/menu/side",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        success: (data) => { 
          console.log("loadSideBarMenu: success",data);
          if(data.body?.dataset) {
            this.initMenuItems(data.body.dataset);            
            let jsAry = this.initSearching(language);
            if(callback) callback(jsAry);
          }
        },
      });
		},
  },
};
</script>
