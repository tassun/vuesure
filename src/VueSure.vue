<!-- App.vue -->
<template>
  <div id="fswaitlayer" class="fa fa-spinner fa-spin"></div>
  <HeaderBar ref="headerBar" :visible="menuVisible" :labels="labels" @language-changed="changeLanguage" @menu-selected="menuSelected"/>
	<LoginForm ref="loginForm" :visible="loginVisible" :labels="labels" version="v1.0.0" @success="loginSuccess" />
  <WorkerFrame ref="workerFrame" :visible="workingVisible" :labels="labels" />
</template>
<script>
import { ref } from 'vue';
import { startApplication }  from './assets/js/apputil.js';
import { getLabelModel } from "./assets/js/labelutil.js";
import HeaderBar from "./components/menu/HeaderBar.vue";
import LoginForm from "./components/form/LoginForm.vue";
import WorkerFrame from "./components/WorkerFrame.vue";
import { refreshScreen, logOut, validAccessToken, verifyAfterLogin, openPage } from "./assets/js/loginutil.js";
import { removeAccessorInfo } from "./assets/js/messenger.js";
import { accessor } from "./assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";

export default {
  components: {
    HeaderBar, LoginForm, WorkerFrame
  },
  setup() {
    let labels = ref(getLabelModel());
    let loginVisible = ref(false);
    let menuVisible = ref(false);
    let workingVisible = ref(false);
    return { labels, accessor, favorite, loginVisible, menuVisible, workingVisible };
  },
  mounted() {
    console.log("App: on mounted ...");
    this.$nextTick(() => {
      startApplication("index");
			validAccessToken((valid,json) => {
				console.log("valid :",valid,", json :",json);
				if(!valid) {
					removeAccessorInfo();
          this.loginVisible = true;
          setTimeout(() => { this.$refs.loginForm.focus(); },5);          
				} else {
					verifyAfterLogin(json,() => {
            this.loginSuccess(json.body);
          },this.accessor);
				}
			});
    });
  },
  methods: {
    changeLanguage(lang) {
      let labelModel = getLabelModel(lang);
      this.labels = labelModel;
    },
    loginSuccess(info) {
      console.log("login success: info",info);
      this.accessor.setInfo(info);      
      if(this.accessor.info?.langcode && this.accessor.info?.langcode.trim().length > 0) {
        this.$refs.headerBar.changeLanguage(this.accessor.info?.langcode);
      }
      this.loginVisible = false;
      this.menuVisible = true;
      this.$refs.headerBar.setting((menulists) => { this.openFistPage(menulists); });
      this.$refs.workerFrame.setting();
      refreshScreen();
    },
    menuSelected(menu) {
      console.log("App.vue: menu selected:",menu);
      if("logout"==menu) { this.goLogOut(); }
      else if("home"==menu) { this.goHome(); }
      else if("intro"==menu) { this.$refs.workerFrame.hideWorkerMenu(); }
      else if("profile"==menu) { this.$refs.workerFrame.showProfile(); }
    },
    goHome() {
      this.workingVisible = false;
      this.$refs.headerBar.showLanguage();
      this.$refs.workerFrame.showWorkerMenu();
    },
    goLogOut() {
      logOut({...this.accessor.info});
      this.$refs.workerFrame.reset();
      this.$refs.headerBar.reset();
      this.$refs.loginForm.reset();
      this.$refs.loginForm.focus();
      this.loginVisible = true;
      this.menuVisible = false;
      this.accessor.reset();
    },
    openFistPage(menulists) {
      let page = this.accessor.info?.firstpage || "worklist";
      console.log("openFirstPage:",page);
      if(menulists && (page && page.trim().length > 0)) {
        let prog = menulists.find((item) => item.element.programid == page );
        if(prog) {
          openPage(prog.element,this.accessor,this.favorite);
        }
      }
    },
    hideMenu() {
      this.$refs.headerBar.collapseSideBar();
    },
  }
};
</script>