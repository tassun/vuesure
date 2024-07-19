<template>
<div id="page_login" class="pt-page pt-page-1 pt-page-current" v-show="visible">
  <div id="page_login_toplayer" class="page-login-logo">                				
      <div id="login_logo_label"><span class="pass-word">PASS</span> &amp; <span class="go-word">GO</span></div>
  </div>
  <div id="page_login_entry" class="page-login-entry">
    <input type="hidden" id="main_useruuid" />
    <div class="main-form" id="main_form" name="main_form">
      <div id="loginformlayer" class="login_form login-portal-area">
        <br/>     
        <label id="login_label" class="login-label">{{ labels.login_label }}</label>   
        <br/>  
        <br/>    
        <div class="input-group-name">
            <label id="login_user_label" class="login-label">{{ labels.username_label }}</label>
            <input ref="main_username" type="text" v-model="localData.username" id="main_username" name="username" class="form-control input-md" placeholder="User" maxlength="60"/>
            <span v-if="v$.username.$error" class="has-error">{{ v$.username.$errors[0].$message }}</span>
        </div>
        <br/>
        <div class="input-group-password">
            <label id="login_password_label" class="login-label">{{ labels.password_label }}</label>
            <input ref="main_pass" type="password" v-model="localData.password" id="main_pass" name="password" class="form-control input-md" placeholder="Password" autocomplete="off" />
            <span v-if="v$.password.$error" class="has-error">{{ v$.password.$errors[0].$message }}</span>
        </div>
        <br/>
        <div class="input-group-forgot"> 
            <a href="javascript:void(0)" id="forgot_password" class="enter-class login-label" title="Forgot Password">{{ labels.forgot_label }}</a>
        </div>
        <br/>										
        <div id="login_button_layer" class="login_button_layer">
            <button id="main_button" class="form-control input-md" @click="loginClick">{{ labels.signin_label }}</button>
        </div>
        <br/>
        <div class="row">
            <div class="col-md-12 text-center">
                <label class="login-label">{{ version }}</label>
            </div>
        </div>
        <br/>
      </div>
    </div>
  </div>
</div>                                                        
</template>
<script>
import $ from "jquery";
import { ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@/assets/js/appinfo.js';
import { startWaiting, stopWaiting, parseErrorThrown, alertbox }  from '@/assets/js/apputil.js';
import { saveAccessorInfo, setupDiffie } from "@/assets/js/messenger.js";

const formData = {
    username: '',
    password: '',
};

export default {
  props: {
    labels: Object,    
    version: {
        type: String,
        required: false,
        default: "v1.0.0",
    },
    visible: {
      type: [String,Boolean],
      default: true,
    }
  },
  emits: ["success"],
  setup(props) {
    let localInfo = ref({});
    let localData = ref({...formData});
    const reqalert = ref(props.labels.empty_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const validateRules = computed(() => { 
      return {
        username: { required: requiredMessage() },
        password: { required: requiredMessage() },
      } 
    });
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    return { v$, localInfo, localData, reqalert };
  },
  mounted() {
    this.$nextTick(() => {
      $(this.$refs.main_pass).on("keydown", (e) => {
        if(e.which==13) { this.connectServer(); }
      });
    });
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.v$.$reset();
    },
    focus() {
      this.$refs.main_username.focus();
    },
    success() {
      this.$emit('success', this.localInfo);
    },
    async validateForm(focusing=true) {
      const valid = await this.v$.$validate();
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
      }
    },
    loginClick() {
      this.connectServer();
    },
    async connectServer() {
      let valid = await this.validateForm();
      if(!valid) return;
      this.startLogin();
    },
    startLogin() {
      let params = {...this.localData};
      console.log("startLogin: params",params);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/sign/signin",
        type: "POST",
        contentType: DEFAULT_CONTENT_TYPE,
        data: params, 
        dataType: "json",
        error : function(transport,status,errorThrown) { 
          stopWaiting();
          errorThrown = parseErrorThrown(transport, status, errorThrown);
          alertbox(errorThrown);
        },
        success: (data,status,xhr) => { 
          console.log("startLogin: responseText",xhr.responseText);
          stopWaiting();
          this.loginSuccess(data);
        }
      });			
    },
    loginSuccess(data) {
      console.log("loginSuccess: data",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        this.localInfo = {...data.body};
        saveAccessorInfo(data.body);
        setupDiffie(data);
        this.success();
      }			
    },
  }
};
</script>
