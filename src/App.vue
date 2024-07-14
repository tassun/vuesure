<!-- App.vue -->
<template>
  <div id="fswaitlayer" class="fa fa-spinner fa-spin"></div>
  <HeaderBar ref="headerBar" :visible="menuVisible" :labels="labels" @language-changed="changeLanguage" @menu-selected="menuSelected"/>
  <SiderBar ref="siderBar" :visible="menuVisible" :labels="labels" />
	<LoginForm ref="loginForm" version="v1.0.0" :labels="labels" @success="loginSuccess" :visible="loginVisible" />
  <WorkerFrame ref="workerFrame" :visible="workingVisible" />
</template>
<script>
import { ref } from 'vue';
import { startApplication }  from './assets/js/apputil.js';
import { getLabelModel } from "./assets/js/labelutil.js";
import HeaderBar from "./components/HeaderBar.vue";
import SiderBar from "./components/SiderBar.vue";
import LoginForm from "./components/LoginForm.vue";
import WorkerFrame from "./components/WorkerFrame.vue";
import { refreshScreen, gotoHomePage, logOut, validAccessToken, verifyAfterLogin } from "./assets/js/menuutil.js";
import { removeAccessorInfo } from "./assets/js/messenger.js";
import { accessor } from "./assets/js/accessor.js";

export default {
  components: {
    HeaderBar, SiderBar, LoginForm, WorkerFrame
  },
  setup() {
    let labels = ref(getLabelModel());
    let loginVisible = ref(true);
    let menuVisible = ref(false);
    let workingVisible = ref(false);
    return { labels, accessor, loginVisible, menuVisible, workingVisible };
  },
  mounted() {
    console.log("App: on mounted ...");
    this.$nextTick(() => {
      startApplication("index");
			validAccessToken((valid,json) => {
				console.log("valid = "+valid+", json : "+json);
				if(!valid) {
					removeAccessorInfo();
          this.$refs.loginForm.focus();
				} else {
					verifyAfterLogin(json,() => {
            this.loginSuccess(json.body);
          });
				}
			});
    });
  },
  methods: {
    changeLanguage(lang) {
      let labelModel = getLabelModel(lang);
      this.labels = labelModel;
      this.$refs.siderBar.changeLanguage(lang);
    },
    loginSuccess(info) {
      console.log("login success: info",info);
      this.accessor.setInfo(info);
      this.loginVisible = false;
      this.menuVisible = true;
      this.$refs.headerBar.setting();
      this.$refs.siderBar.setting();
      this.$refs.siderBar.show();
      this.$refs.workerFrame.setting();
      refreshScreen();
    },
    menuSelected(menu) {
      console.log("App.vue: menu selected:",menu);
      if("home"==menu) { this.goHome(); }
      else if("logout"==menu) { this.goLogOut(); }
      else if("menu"==menu) { this.$refs.siderBar.displaySideBarMenu(); }
    },
    goHome() {
      //this.$refs.workerFrame.loadPageFirst();
      gotoHomePage();
    },
    goLogOut() {
      logOut({...this.accessor.info});
      this.$refs.workerFrame.reset();
      this.$refs.headerBar.reset();
      this.$refs.siderBar.reset();
      this.$refs.loginForm.reset();
      this.$refs.loginForm.focus();
      this.loginVisible = true;
      this.menuVisible = false;
      this.accessor.setInfo({});
    },
  }
};
</script>