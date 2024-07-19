<!-- App.vue -->
<template>
  <div id="fswaitlayer" class="fa fa-spinner fa-spin"></div>
  <div id="mainlayer" ref="mainlayer" v-show="isShowing == true">
    <HeaderBar ref="headerBar" :visible="menuVisible" :labels="labels" @language-changed="changeLanguage" @menu-selected="menuSelected" />
    <LoginForm ref="loginForm" :visible="loginVisible" :labels="labels" version="v1.0.0" @success="loginSuccess" />
    <WorkerFrame ref="workerFrame" :visible="workingVisible" :labels="labels" />
  </div>
  <div id="forcelayer" ref="forcelayer" v-show="isShowing == false">
    <component :is="currentForcePage" :labels="labels" ref="forceComponent" @activated="componentActivated" @success="processSuccess" />
  </div>
</template>
<script>
import { ref } from 'vue';
import { startApplication }  from './assets/js/apputil.js';
import { getLabelModel } from "./assets/js/labelutil.js";
import { refreshScreen, logOut, validAccessToken, openPage } from "./assets/js/loginutil.js";
import { removeAccessorInfo } from "./assets/js/messenger.js";
import { accessor } from "./assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";
import HeaderBar from "./components/menu/HeaderBar.vue";
import LoginForm from "./components/form/LoginForm.vue";
import WorkerFrame from "./components/WorkerFrame.vue";
import BlankForm from "./components/form/BlankForm.vue";
import ChangeForm from './components/form/ChangeForm.vue';

export default {
  components: {
    HeaderBar, LoginForm, WorkerFrame, BlankForm, ChangeForm
  },
  setup() {
    let labels = ref(getLabelModel());
    let isShowing = ref(true);
    let loginVisible = ref(false);
    let menuVisible = ref(false);
    let workingVisible = ref(false);
    let currentForcePage = ref("BlankForm");
    return { labels, accessor, favorite, isShowing, loginVisible, menuVisible, workingVisible, currentForcePage };
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
					this.verifyLogin(json);
				}
			});
    });
  },
  methods: {
    changeLanguage(lang) {
      let labelModel = getLabelModel(lang);
      this.labels = labelModel;
    },
    verifyLogin(json) {
      console.log("verifyLogin:",json);
      if(json.body?.changeflag=="1") {
        console.log("force change password ...");
      } else if(json.body?.expireflag=="1") {
        console.log("password expired ...");
      } else {
        this.loginSuccess(json.body);
      }
    },
    loginSuccess(info) {
      console.log("login success: info",info);
      this.accessor.setInfo(info);      
      if(this.accessor.info?.langcode && this.accessor.info?.langcode.trim().length > 0) {
        this.$refs.headerBar.changeLanguage(this.accessor.info?.langcode);
      }
      this.displayMenu();
    },
    displayMenu() {
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
      else if("changepassword"==menu) { this.$refs.workerFrame.showChangePassword(); }
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
    componentActivated(name) {
      console.log("component activated: ",name);
    },
    processSuccess(action,info) {
      console.log("processSuccess: action",action,", info",info);
      if("changepassword"==action) {
        this.displayMenu();
      }
    },
  }
};
</script>