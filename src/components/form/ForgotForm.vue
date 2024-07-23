<template>
    <div class="pt-page forgot-page">
      <h1 class="page-header-title">{{ labels.forgot_caption }}</h1>
      <div id="page_forgot" class="entry-layer page-layer forgot-layer portal-area" v-show="successVisible == false">
        <div class="portal-area sub-entry-layer forgot-area">
          <br/>
          <div class="row row-heighter center-block">
            <div class="col-md-12">
              <label id="forgotpassword_info">{{ labels.forgotpassword_info }}</label>
            </div>
          </div>
          <div class="row row-heighter center-block">
            <div class="col-md-6 col-height form-group" id="email_layer">
              <div class="input-group" :class="{'has-error': v$.email.$error}">
                <div class="input-group-prepend">
                  <span class="input-group-text" title="Email"><i class="fa fa-envelope-o" aria-hidden="true"></i></span>
                </div>
                <input ref="email" v-model="localData.email" type="email" class="form-control input-md my-input alert-input" id="email" name="email" :placeholder="labels.email_label" />
              </div>		
              <span v-if="v$.email.$error" class="has-error">{{ v$.email.$errors[0].$message }}</span>
            </div>
          </div>
          <div class="row row-heighter center-block">
            <div class="col-md-4 col-height form-group" id="secureimage_layer">
              <div class="btn-group mr-2" role="group">
                <img id="secureimage" alt=""/>
              </div>
              <div class="btn-group mr-2" role="group" id="secureimage_ctrl_layer">
                <button @click.stop="refreshClick" id="secureimage_ctrl" title="Refresh" class="btn btn-sm btn-base" tabIndex="-1"><em class="fa fa-refresh" aria-hidden="true"></em></button>
              </div>
            </div>
          </div>
          <div class="row row-heighter center-block">
            <div class="col-md-12">
              <label id="securecode_info">{{ labels.securecode_info }}</label>
            </div>
          </div>
          <div class="row row-heighter center-block">
            <div class="col-md-4 col-height form-group" id="securecode_layer">
              <div class="input-group" :class="{'has-error': v$.securecode.$error}">
                <div class="input-group-prepend">
                  <span class="input-group-text" title="Answer Code"><i class="fa fa-unlock-alt" aria-hidden="true"></i></span>
                </div>
                <input ref="securecode" v-model="localData.securecode" type="text" class="form-control input-md my-input alert-input" id="securecode" name="securecode" :placeholder="labels.securecode_label" />
              </div>
              <span v-if="v$.securecode.$error" class="has-error">{{ v$.securecode.$errors[0].$message }}</span>	
            </div>
          </div>
        </div>
        <hr/>
        <div class="row row-heighter">
          <div class="col-md-12 col-height text-center button-control-layer">
            <button @click.stop="sendClick" id="sendbutton" class="btn btn-dark btn-sm"><em class="fa fa-send fa-btn-icon"></em> {{ labels.send_button }}</button>
            <button @click.stop="cancelClick" id="cancelbutton" class="btn btn-dark btn-sm"><em class="fa fa-close fa-btn-icon"></em> {{ labels.cancel_button }}</button>
          </div>
        </div>			
      </div>
      <div id="page_forgot_success" class="entry-layer page-layer forgot-layer portal-area" v-show="successVisible == true">
          <div class="row portal-area sub-entry-layer">
            <br/>
            <table width="100%">
                <tbody>
                    <tr class="rclass">
                        <td height="50">&nbsp;</td>
                    </tr>
                    <tr class="rclass">
                        <td align="center" height="30"><label class="lclass" id="resetpwd_label" required="false">{{ labels.resetpwd_label }}</label></td>
                    </tr>
                    <tr>
                        <td align="center" height="30"><label class="lclass" id="resetmsg_label" required="false">{{ labels.resetmsg_label }}</label></td>
                    </tr>
                    <tr>
                        <td align="center" height="30"><a href="javascript:void(0)" id="loginlink" @click.stop="loginClick">{{ labels.resetlogin_label }}</a></td>
                    </tr>
                </tbody>
            </table>
          </div>	
      </div>
    </div>
</template>
<style>
.sub-entry-layer { padding-top: 10px; padding-left: 5px; padding-bottom: 15px; }
.forgot-layer { margin-top: 0px; margin-left: 3px; padding-bottom: 20px;}
.forgot-area { padding-left: 20px; }
.forgot-page { width:99.8%; display: block; }
#secureimage { border: 1px solid gray; }
#secureimage_ctrl { min-width:30px; }
#secureimage_ctrl_layer { vertical-align: bottom; }
.button-control-layer { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; }
.button-control-layer > button { margin-right: 15px; }
</style>
<script>
import $ from "jquery";
import { ref, computed, watch, onActivated } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, email } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@/assets/js/appinfo.js';
import { startWaiting, stopWaiting, alertbox, confirmSend, submitFailure }  from '@/assets/js/apputil.js';

const formData = {
    email: '',
    securecode: '',
    capid: '',
};

export default {
  props: {
    labels: Object,    
  },
  setup(props,context) {
    const localData = ref({...formData});
    const successVisible = ref(false);
    const reqalert = ref(props.labels.empty_alert);
    const emailalert = ref(props.labels.email_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const emailMessage = () => {
      return helpers.withMessage(emailalert, email);
    }
    const validateRules = computed(() => { 
      return {
        email: { required: requiredMessage(), email: emailMessage() },
        securecode: { required: requiredMessage() },
      } 
    });    
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    let onactivated = onActivated(() => {
        console.log("ForgotForm.vue: onActivated ... ");
        context.emit("activated","forgot");
    });
    return { v$, localData, reqalert, emailalert, successVisible, onactivated };
  },
  created() {
    watch(this.$props, (newProps) => {      
      this.reqalert = newProps.labels.empty_alert;
      this.emailalert = newProps.labels.email_alert;
    });
  },
  mounted() {
    console.log("ForgotForm.vue mounted ...");
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.v$.$reset();
      this.successVisible = false;
    },
    setting() {
        console.log("ForgotForm.vue: setting ...");
        this.loadSecureImage();
    },
    focus() {
      this.$refs.email.focus();
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
    loadSecureImage() {
      console.log("ForgotForm.vue loadSecureImage ...");
      let formdata = { capid: this.localData.capid };
      $.ajax({
          url: getApiUrl()+"/api/captcha/create",
          data: formdata,
          type: "POST",
          dataType: "json",
          contentType: DEFAULT_CONTENT_TYPE,
          error : function(transport,status,errorThrown) { 
            submitFailure(transport,status,errorThrown,false);
          },
          success: (data,status,transport) => { 
            console.log("loadSecureImage: success",transport.responseText);                
            if(data.body?.rows?.id && data.body?.rows?.src) {
              this.localData.capid = data.body.rows.id;
              $("#secureimage").attr("src",data.body.rows.src);
            }
          },
      });	
    },
    refreshClick() {
      this.loadSecureImage();
    },
    cancelClick() {
      this.$root.goLogIn();
    },
    async sendClick() {
      console.log("click: send");
      let valid = await this.validateForm();
      if(!valid) return;
      this.startSendRecord();
    },
    startSendRecord() {
      confirmSend(() => { 
        this.sendRecord(this.localData);
      });
    },
    sendRecord(dataRecord) {
      let jsondata = {ajax: true};
      let formdata = Object.assign(jsondata,dataRecord);
      console.log("sendRecord: formdata",formdata);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/forgot/password",
        data: formdata,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) { 
          submitFailure(transport,status,errorThrown,false);
        },
        success: (data,status,xhr) => { 
          console.log("sendRecord: success : ",xhr.responseText);
          stopWaiting();
          this.sendSuccess(data);
        }
      });			
    },
    sendSuccess(data) {
      console.log("sendSuccess : ",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        this.successVisible = true;
      }			
    },
    display() {
      this.reset();
      this.focus();
      this.refreshClick();
    },
    loginClick() {
        this.$root.goLogIn();
    },
  }
};
</script>
