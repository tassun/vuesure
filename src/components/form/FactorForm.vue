<template>
<div id="factor_verify" class="pt-page pt-page-current forcer-page">
  <h1 class="page-header-title" title="2FA Verification">{{ labels.factor_caption }}</h1>
	<div id="factor_entrypanel">
    <div id="factor_entrylayer" class="entry-layer">
			<div class="portal-area sub-entry-layer">
				<div class="row row-height">
					<div class="col-md-3 col-height col-label text-right">&nbsp;</div>
					<div class="col-md-8 col-height">
            <template v-if="isEnglish">
                The system force you to entry verification code, please specify your Google Authenticator code.<br/>
                <span v-if="!isFactorRegistered">You can download mobile application Google Authenticator and add with QR Code via <a href="javascript:void(0)" title="Add Google Authenticator" tabIndex="-1" @click="openFactorInfo">Add 2FA</a></span>
            </template>
            <template v-else>
                ระบบต้องการตรวจสอบเพิ่มเติม โปรดระบุรหัสจากโปรแกรมมือถือ Google Authenticator<br/>
                <span v-if="!isFactorRegistered">สามารถดาวน์โหลดโปรแกรมมือถือ Google Authenticator และทำการเพิ่มได้ที่ <a href="javascript:void(0)" title="Add Google Authenticator" tabIndex="-1" @click="openFactorInfo">เพิ่ม 2FA</a></span>
            </template>                        
						<br/>
					</div>
				</div>
				<div class="row row-height">
					<div class="col-md-4"></div>
					<div class="col-height col-md-4 factor-code-layer">
						<label for="factorcode" id="factorcode_label" class="control-label">{{ labels.factorcode_label }}</label>
						<div class="input-grouper" :class="{'has-error': v$.factorcode.$error}">
							<input ref="factorcode" v-model="localData.factorcode" type="text" id="factorcode" name="factorcode" class="form-control input-md irequired alert-input" maxlength="8" placeholder="Code"/>
						</div>
						<span v-if="v$.factorcode.$error" class="has-error">{{ v$.factorcode.$errors[0].$message }}</span>
					</div>
				</div>			
				<div class="row row-height">
					<div class="col-md-4"></div>
					<div class="col-md-4 factor-link-layer">						
						<a v-if="!isFactorRegistered" href="javascript:void(0)" id="factorliker" class="factor-linker" title="Add Google Authenticator" tabIndex="-1" @click="openFactorInfo">{{ labels.factor_label }}</a>
						<button @click.stop="submitClick" id="submitbutton" class="btn btn-dark btn-sm pull-right"><em class="fa fa-ticket fa-btn-icon"></em>{{ labels.submit_button }}</button>
					</div>
				</div>
			</div>
    </div>
	</div>
	<br/>
</div>
<teleport to="#modaldialog">
  <div id="factormodaldialog_layer" class="modal fade pt-page pt-page-item" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-xm">
      <div class="modal-content portal-area  fa-portal-area">
        <div class="modal-header">
            <h4 class="modal-title" id="modalheadertitle">Verification</h4>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <br/><br/>	
        <div class="text-center">
            <h4>Scan QR Code add to Google Authenticator</h4>
        </div>
        <br/><br/>	
        <div class="qr-image-layer">
            <img id="qrimg" alt="" />
        </div>
      </div>
    </div>
  </div>
</teleport>
</template>
<style>
#factor_entrylayer { margin-left: 3px; }
.qr-image-layer { text-align:center; min-height: 300px; margin-top: 20px; }
.factor-code-layer { min-height: 100px; }
.factor-link-layer { margin-top:10px; }
.forcer-page { max-width: 95%; display: block; margin-left: auto; margin-right: auto; }
.qr-body { background-color: whitesmoke; }
</style>
<script>
import $ from "jquery";
import { ref, computed, watch, onActivated } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@/assets/js/app.info.js';
import { startWaiting, stopWaiting, alertbox, submitFailure }  from '@/assets/js/app.util.js';
import { getAccessorToken } from "@/assets/js/messenger.js";
import { accessor } from "@/assets/js/accessor.js";

const formData = {
    factorcode: '',
    factorid: '',
};

export default {
  props: {
    labels: Object,    
  },
  emits: ["success"],
  setup(props,context) {
    const localData = ref({...formData});
    const alreadyLoaded = ref(false);
    const reqalert = ref(props.labels.empty_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const validateRules = computed(() => { 
      return {
        factorcode: { required: requiredMessage() },
      } 
    });    
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    let onactivated = onActivated(() => {
        console.log("FactorForm.vue: onActivated ... ");
        context.emit("activated","factor");
    });
    return { accessor, v$, localData, reqalert, onactivated, alreadyLoaded };
  },
  created() {
    watch(this.$props, (newProps) => {      
      this.reqalert = newProps.labels.empty_alert;
    });
  },
  mounted() {
    console.log("FactorForm.vue mounted ...");
    this.$nextTick(() => {
      $(this.$refs.factorcode).on("keydown", (e) => {
        if(e.which==13) { this.submitClick(); }
      });
      $("#factormodaldialog_layer").find(".modal-dialog").draggable();
    });
  },
  computed: {
    isEnglish() { return this.accessor.lang == "EN"; },
    isFactorRegistered() { return this.accessor.info?.factorflag == '1'; },
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.localData.factorid = this.accessor.info?.factorid;
      this.v$.$reset();
      this.alreadyLoaded = false;
    },
    setting() {
        console.log("FactorForm.vue: setting ...");
    },
    focus() {
      this.$refs.factorcode.focus();
    },
    success() {
      this.$emit('success', 'factor', this.localData);
    },
    async validateForm(focusing=true) {
      console.log("validateForm: localData",this.localData);
      const valid = await this.v$.$validate();
      console.log("validate form: valid",valid);
      console.log("error:",this.v$.$errors);
      if(!valid) {
        if(focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if(this.v$.$errors && this.v$.$errors.length > 0) {
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if(el) el.focus();
        else $("#"+input).trigger("focus");
      }
    },
    loadQRCode() {
      let formdata = { factorid: this.localData.factorid, authtoken: getAccessorToken() };
      console.log("FactorForm.vue loadQRCode: alreadyLoaded=",this.alreadyLoaded,", formdata",formdata);
      if(this.alreadyLoaded) return;
      startWaiting();
      $.ajax({
          url: getApiUrl()+"/api/factor/get",
          data: formdata,
          type: "POST",
          dataType: "json",
          contentType: DEFAULT_CONTENT_TYPE,
          error : function(transport,status,errorThrown) { 
            submitFailure(transport,status,errorThrown,false);
          },
          success: (data,status,transport) => { 
            stopWaiting();
            console.log("loadQRCode: success",transport.responseText);                
            if(data.body?.factorimage) {
              $("#qrimg").attr("src",data.body?.factorimage);
              this.alreadyLoaded = true;
            }
          },
      });	
    },
    async submitClick() {
      console.log("click: submit");
      let valid = await this.validateForm();
      if(!valid) return;
      this.startSubmitRecord();
    },
    startSubmitRecord() {
        this.submitRecord(this.localData);
    },
    submitRecord(dataRecord) {
      let jsondata = {ajax: true};
      let formdata = Object.assign(jsondata,dataRecord);
      console.log("submitRecord: formdata",formdata);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/factor/verify",
        data: formdata,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) { 
          submitFailure(transport,status,errorThrown,false);
        },
        success: (data,status,xhr) => { 
          console.log("submitRecord: success : ",xhr.responseText);
          stopWaiting();
          this.submitSuccess(data);
        }
      });			
    },
    submitSuccess(data) {
      console.log("submitSuccess : ",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        this.accessor.info.factorcode = this.localData.factorcode;
        this.success();
      }			
    },
    display() {
      this.reset();
      setTimeout(() => { this.focus(); },100);
    },
    loginClick() {
        this.$root.goLogIn();
    },
    openFactorInfo() {
        $("#factormodaldialog_layer").modal("show");
        this.loadQRCode();
    },
  }
};
</script>
