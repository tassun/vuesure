<template>
<div id="ssologinlayer">
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
<script>
import $ from "jquery";
import { ref } from 'vue';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@/assets/js/appinfo.js';

export default {
  props: {
    labels: Object,    
  },
  emits: ["sso-selected"],
  setup() {
    const ssolists = ref([]);
    return { ssolists };
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
            success: (data,status,transport) => { 
                console.log("loadSettings: success",transport.responseText);                
                if(data.body?.rows) {
                    this.ssolists = data.body.rows;
                }                
            },
        });	
    },
  }
};
</script>
