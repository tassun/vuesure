<template>
  <div id="fsworkinglayer" class="working-class working-control-class">
    <div ref="pagecontainer" id="pagecontainer" class="pt-pager">
      <WorkerMenu ref="workerMenu" :visible="menuVisible" />
    </div> 
    <iframe id="workingframe" name="workingframe" width="100%" class="working-frame" title="Working" v-show="workingVisible"></iframe>
  </div> 
</template>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { stopWaiting }  from '@/assets/js/apputil.js';
import { refreshScreen } from "@/assets/js/loginutil";
import { accessor } from "@/assets/js/accessor.js";
import WorkerMenu from "./menu/WorkerMenu.vue";

export default {
  components: { WorkerMenu },
  props: {
    visible: {
      type: [String,Boolean],
      default: false,
    },
  },
  setup(props) {
    const menuVisible = ref(props.visible);
    const workingVisible = ref(props.visible);
    return { accessor, menuVisible, workingVisible };
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
    },
    setting() {
      this.showWorkerMenu();
    },
    showWorkerMenu() {
      $("#pagecontainer").show();
      this.menuVisible = true;
      this.workingVisible = false;
    },
    hideWorkerMenu() {
      this.menuVisible = false;
    },
    showWorking() { 
      this.workingVisible = true;
      this.menuVisible = false;
      $("#pagecontainer").hide();
    },
    hideWorking() {
      this.workingVisible = false;
    },
  },
};
</script>
