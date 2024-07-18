<template>
  <div id="fsworkinglayer" class="working-class working-control-class">
    <div ref="pagecontainer" id="pagecontainer" class="pt-pager">
      <keep-alive>
        <component :is="currentComponent" :visible="componentVisible" :labels="labels" ref="viewComponent" @activated="componentActivated" @success="updateSuccess"/>
      </keep-alive>
    </div> 
    <iframe id="workingframe" name="workingframe" width="100%" class="working-frame" title="Working" v-show="workingVisible"></iframe>
  </div> 
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { stopWaiting }  from '@/assets/js/apputil.js';
import { refreshScreen } from "@/assets/js/loginutil.js";
import { accessor } from "@/assets/js/accessor.js";
import WorkerMenu from "./menu/WorkerMenu.vue";
import ProfileForm from "./form/ProfileForm.vue";

export default {
  components: { WorkerMenu, ProfileForm },
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
      $("#workingframe").hide();
    },
    setting() {
      this.showWorkerMenu();
    },
    showWorkerMenu() {
      $("#pagecontainer").show();
      this.componentVisible = true;
      this.workingVisible = false;
      this.currentComponent = "WorkerMenu";
      $("#workingframe").hide();
    },
    hideWorkerMenu() {
      this.componentVisible = false;
    },
    showWorking() { 
      this.workingVisible = true;
      this.componentVisible = false;
      $("#pagecontainer").hide();
    },
    hideWorking() {
      this.workingVisible = false;
    },
    showProfile() {
      $("#pagecontainer").show();
      this.workingVisible = false;
      this.componentVisible = true;
      this.currentComponent = "ProfileForm";
      //this.$refs.profileForm.display();
      console.log("viewComponent",this.$refs.viewComponent);
    },
    componentActivated(name) {
      console.log("component activated: ",name);
      if("profile"==name) this.$refs.viewComponent.display();
    },
    updateSuccess(action,info) {
      console.log("updateSuccess: action",action,", info",info);
      if("profile"==action) {
        this.showWorkerMenu();
      }
    },
  },
};
</script>
