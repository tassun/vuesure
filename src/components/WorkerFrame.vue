<template>
  <div id="fsworkinglayer" class="working-class working-control-class">
    <div ref="pagecontainer" id="pagecontainer" class="pt-pager">
      <WorkerMenu ref="workerMenu" :visible="menuVisible" />
      <ProfileForm ref="profileForm" :visible="profileVisible" :labels="labels" />
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
    let menuVisible = ref(props.visible);
    let workingVisible = ref(props.visible);
    let profileVisible = ref(false);
    let currentComponent = ref("WorkerMenu");
    return { accessor, menuVisible, workingVisible, profileVisible, currentComponent };
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
      this.menuVisible = false;
      this.workingVisible = false;
      this.profileVisible = false;
    },
    setting() {
      this.showWorkerMenu();
    },
    showWorkerMenu() {
      $("#pagecontainer").show();
      this.menuVisible = true;
      this.workingVisible = false;
      this.profileVisible = false;
      this.currentComponent = "WorkerMenu";
    },
    hideWorkerMenu() {
      this.menuVisible = false;
    },
    showWorking() { 
      this.workingVisible = true;
      this.menuVisible = false;
      this.profileVisible = false;
      $("#pagecontainer").hide();
    },
    hideWorking() {
      this.workingVisible = false;
    },
    showProfile() {
      $("#pagecontainer").show();
      this.workingVisible = false;
      this.menuVisible = false;
      this.profileVisible = true;
      this.currentComponent = "ProfileForm";
      this.$refs.profileForm.display();
    },
  },
};
</script>
