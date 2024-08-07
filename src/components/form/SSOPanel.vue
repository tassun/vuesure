<template>
<div id="ssologinlayer">
    <div class="loading-layer" v-show="loadingVisible">
        <span class="loading-span"><em class="fa fa-spinner fa-spin"></em></span><br/>
    </div>
    <div class="login_button_layer" v-if="ssolists.length > 0">
        <fieldset class="login-field-set">
            <legend class="login-legend">
        <label class="login-label">{{ labels.sso_label }}</label>
            </legend>
        </fieldset>
    </div>		
    <div class="login_button_layer" v-for="item in ssolists" :key="item.domainid">
        <div class="link-button-cover">
            <a class="link-button form-control input-md fa-link-sso-biz" href="javascript:void(0)" :data-domain="item.domainid" @click="$emit('sso-selected',item)">{{ item.description }}</a>
        </div>
    </div>				
</div>
</template>
<style scoped>
.loading-span { color: #1E90FF; font-size: 2.0rem; }
.loading-layer { text-align: center; font-size: 2.0rem; padding-top: 50px; }
</style>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@willsofts/will-app';

export default {
  props: {
    labels: Object,    
  },
  emits: ["sso-selected","sso-setting"],
  setup() {
    const ssolists = ref([]);
    const loadingVisible = ref(true);
    return { ssolists, loadingVisible };
  },
  mounted() {
    console.log("SSOPanel.vue mounted ...");
    this.$nextTick(() => {
        this.setting();
    });
  },
  methods: {
    setting() {
        console.log("SSOPanel.vue: setting ...");
        this.loadSettings();
    },
    loadSettings() {
        console.log("SSOPanel.vue loadSettings ...");
        $.ajax({
            url: getApiUrl()+"/auth/directory/retrieve",
            type: "POST",
            dataType: "json",
            contentType: DEFAULT_CONTENT_TYPE,
            error : () => {
                this.loadingVisible = false;
                this.$emit("sso-setting",this.ssolists);
            },
            success: (data,status,transport) => {
                this.loadingVisible = false;
                console.log("loadSettings: success",transport.responseText);                
                if(data.body?.rows) {
                    this.ssolists = data.body.rows;
                    this.$emit("sso-setting",this.ssolists);
                }                
            },
        });	
    },
  }
};
</script>
