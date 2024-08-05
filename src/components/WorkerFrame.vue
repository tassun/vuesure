<template>
  <div id="fsworkinglayer" class="working-class working-control-class">
    <div ref="pagecontainer" id="pagecontainer" class="pt-pager">
      <keep-alive>
        <component :is="currentComponent" :visible="componentVisible" :labels="labels" ref="viewComponent" @activated="componentActivated" @success="processSuccess" />
      </keep-alive>
    </div> 
    <iframe id="workingframe" name="workingframe" width="100%" class="working-frame" title="Working" v-show="workingVisible"></iframe>
  </div> 
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { stopWaiting }  from '@/assets/js/app.util.js';
import { refreshScreen, hideWorkSpace } from "@/assets/js/login.util.js";
import { accessor } from "@/assets/js/accessor.js";
import WorkerMenu from "./menu/WorkerMenu.vue";
import ProfileForm from "./form/ProfileForm.vue";
import ChangeForm from "./form/ChangeForm.vue";

export default {
  components: { WorkerMenu, ProfileForm, ChangeForm },
  props: {
    labels: Object,    
    visible: {
      type: [String,Boolean],
      default: false,
    },
  },
  setup(props) {
    let componentVisible = ref(props.visible);
    let workingVisible = ref(props.visible);
    let currentComponent = ref("WorkerMenu");
    return { accessor, componentVisible, workingVisible, currentComponent };
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
      this.componentVisible = false;
      this.workingVisible = false;
      hideWorkSpace();
    },
    setting() {
      this.showWorkerMenu();
    },
    showWorkerMenu() {
      $("#pagecontainer").show();
      this.componentVisible = true;
      this.workingVisible = false;
      this.currentComponent = "WorkerMenu";
      hideWorkSpace();
    },
    hideWorkerMenu() {
      this.componentVisible = false;
    },
    showWorking() { 
      this.workingVisible = true;
      this.componentVisible = false;
      $("#pagecontainer").hide();
      $("#workingframe").show();
    },
    hideWorking() {
      this.workingVisible = false;
      hideWorkSpace();
    },
    showProfile() {
      $("#pagecontainer").show();
      this.workingVisible = false;
      this.componentVisible = true;
      this.currentComponent = "ProfileForm";
      hideWorkSpace();
    },
    showChangePassword() {
      $("#pagecontainer").show();
      this.workingVisible = false;
      this.componentVisible = true;
      this.currentComponent = "ChangeForm";
      hideWorkSpace();
    },
    componentActivated(name) {
      console.log("component activated: ",name);
      if("profile"==name) this.$refs.viewComponent.display();
      if("changepassword"==name) this.$refs.viewComponent.display();
    },
    processSuccess(action,info) {
      console.log("processSuccess: action",action,", info",info);
      if("profile"==action || "changepassword"==action) {
        this.showWorkerMenu();
      }
    },
  },
};
</script>
