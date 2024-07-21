<template>
	<div id="page_profile" class="pt-page pt-page-current pt-page-controller" v-show="visible">
		<h1 class="page-header-title" title="page_profile">{{ labels.profile_caption }}</h1>
    <div id="profile_loading" v-show="loadVisible == true">
      <span>Loading ...</span>
    </div>
		<div id="profile_entrypanel" v-show="loadVisible == false">
      <div id="profile_entrylayer" class="entry-layer" v-show="infoVisible">
          <div class="portal-area sub-entry-layer">
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="usertname_label" class="control-label" required="true">{{ labels.usertname_label }}</label>
                  </div>
                  <div class="col-md-5 col-height" :class="{'has-error': v$.usertname.$error}">
                      <input ref="usertname" class="form-control input-md alert-input" id="usertname" name="usertname" :placeholder="labels.usertname_label" autocomplete="off" size="50" v-model="localData.usertname"/>
                      <span v-if="v$.usertname.$error" class="has-error">{{ v$.usertname.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="usertsurname_label" class="control-label" required="true">{{ labels.usertsurname_label }}</label>
                  </div>
                  <div class="col-md-5 col-height" :class="{'has-error': v$.usertsurname.$error}">
                      <input ref="usertsurname" class="form-control input-md alert-input" id="usertsurname" name="usertsurname" :placeholder="labels.usertsurname_label" autocomplete="off" size="50" v-model="localData.usertsurname"/>
                      <span v-if="v$.usertsurname.$error" class="has-error">{{ v$.usertsurname.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="userename_label" class="control-label" required="true">{{ labels.userename_label }} </label>
                  </div>
                  <div class="col-md-5 col-height" :class="{'has-error': v$.userename.$error}">
                      <input ref="userename" class="form-control input-md alert-input" id="userename" name="userename" :placeholder="labels.userename_label" autocomplete="off" size="50" v-model="localData.userename"/>
                      <span v-if="v$.userename.$error" class="has-error">{{ v$.userename.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="useresurname_label" class="control-label" required="true">{{ labels.useresurname_label }}</label>
                  </div>
                  <div class="col-md-5 col-height" :class="{'has-error': v$.useresurname.$error}">
                      <input ref="useresurname" class="form-control input-md alert-input" id="useresurname" name="useresurname" :placeholder="labels.useresurname_label" autocomplete="off" size="50" v-model="localData.useresurname"/>
                      <span v-if="v$.useresurname.$error" class="has-error">{{ v$.useresurname.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="displayname_label" class="control-label">{{ labels.displayname_label }}</label>
                  </div>
                  <div class="col-md-3 col-height" :class="{'has-error': v$.displayname.$error}">
                      <input ref="displayname" class="form-control input-md alert-input" id="displayname" name="displayname" autocomplete="off" size="50" v-model="localData.displayname" />
                      <span v-if="v$.displayname.$error" class="has-error">{{ v$.displayname.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="email_label" class="control-label">{{ labels.email_label }}</label>
                  </div>
                  <div class="col-md-3 col-height" :class="{'has-error': v$.email.$error}">
                      <input ref="email" class="form-control input-md alert-input" id="email" name="email" :placeholder="labels.email_label" autocomplete="off" size="30" v-model="localData.email"/>
                      <span v-if="v$.email.$error" class="has-error">{{ v$.email.$errors[0].$message }}</span>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="mobile_label" class="control-label">{{ labels.mobile_label }}</label>
                  </div>
                  <div class="col-md-3 col-height">
                      <input ref="mobile" class="form-control input-md" id="mobile" name="mobile" :placeholder="labels.mobile_label" autocomplete="off" size="20" v-model="localData.mobile"/>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="lineid_label" class="control-label">{{ labels.lineid_label }}</label>
                  </div>
                  <div class="col-md-3 col-height">
                      <input ref="lineid" class="form-control input-md" id="lineid" name="lineid" :placeholder="labels.lineid_label" autocomplete="off" size="50" v-model="localData.lineid"/>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-3 col-height col-label">
                      <label id="langcode_label" class="control-label">{{ labels.langcode_label }}</label>
                  </div>
                  <div class="col-md-3 col-height">
                      <select ref="langcode" class="form-control input-md" v-model="localData.langcode">
                        <option value=""></option>
                        <option v-for="item in langlists" :key="item.typeid" :value="item.typeid">{{ getDisplayLanguageName(item) }}</option>
                      </select>
                  </div>
              </div>
              <div class="row row-height">
                  <div class="col-md-12 float-right pull-right text-right btn-ctrl-cover" id="buttoncoverlayer">
                      <button class="btn btn-dark btn-sm" @click.stop="saveClick"><em class="fa fa-save fa-btn-icon"></em> {{ labels.save_button }}</button>
                  </div>
              </div>
          </div>
      </div>
      <div class="entry-layer entry-not-found" v-show="notfoundVisible">{{ labels.profilenotfound_label }}</div>
    </div>
	</div>
</template>
<style>
.entry-not-found { text-align: center; font-size: 25px; padding-top: 15px; }
#profile_loading { text-align: center; font-size: 2.0rem; padding-top: 50px; }
</style>
<script>
import $ from "jquery";
import { ref, computed, watch, onActivated } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, email } from '@vuelidate/validators';
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@/assets/js/appinfo.js';
import { startWaiting, stopWaiting, parseErrorThrown, alertbox, serializeParameters, confirmSave, successbox }  from '@/assets/js/apputil.js';
import { accessor } from "@/assets/js/accessor.js";

const formData = {
    usertname: '',
    usertsurname: '',
    userename: '',
    useresurname: '',
    displayname: '',
    email: '',
    mobile: '',
    lineid: '',
    langcode: '',
};

export default {
  props: {
    labels: Object,    
    visible: {
      type: [String,Boolean],
      default: false,
    },
  },
  emits: ["success"],
  setup(props,context) {
    const localData = ref({...formData});
    const loadVisible = ref(true);
    const infoVisible = ref(true);
    const notfoundVisible = ref(false);
    const langlists = ref([]);
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
        usertname: { required: requiredMessage() },
        usertsurname: { required: requiredMessage() },
        userename: { required: requiredMessage() },
        useresurname: { required: requiredMessage() },
        displayname: { required: requiredMessage() },
        email: { required: requiredMessage(), email: emailMessage() },
      } 
    });    
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    const onactivated = onActivated(() => {
      console.log("ProfileForm.vue: onActivated ... ");
      context.emit("activated","profile");
    });
    return { accessor, v$, localData, reqalert, emailalert, loadVisible, infoVisible, notfoundVisible, langlists, onactivated };
  },
  created() {
    watch(this.$props, (newProps) => {      
      this.reqalert = newProps.labels.empty_alert;
      this.emailalert = newProps.labels.email_alert;
    });
  },
  mounted() {
    console.log("ProfileForm.vue mounted ...");
    this.$nextTick(() => {
        this.setting();
    });
  },
  methods: {
    reset() {
      this.localData = {...formData};
      this.v$.$reset();
      this.infoVisible = true;
      this.notfoundVisible = false;
    },
    setting() {
        console.log("ProfileForm.vue: setting ...");
        this.loadLanguages();
    },
    focus() {
      this.$refs.usertname.focus();
    },
    success() {
      this.$emit('success', "profile", this.localData);
    },
    async validateForm(focusing=true) {
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
    loadLanguages() {
        console.log("ProfileForm.vue loadLanguages ...");
        let params = { names: "tklanguage" };
        let formdata = serializeParameters({ajax: true},params,true);
        $.ajax({
            url: getApiUrl()+"/api/category/lists",
            data: formdata.jsondata,
            headers : formdata.headers,
            type: "POST",
            dataType: "json",
            contentType: DEFAULT_CONTENT_TYPE,
            success: (data,status,transport) => { 
                console.log("loadLanguages: success",transport.responseText);                
                if(data.body?.length > 0) {
                  let ds = data.body[0];
                  if(ds.resultset?.rows) {
                    this.langlists = ds.resultset.rows;
                  }
                }                
            },
        });	
    },
    getDisplayLanguageName(item) {
        return this.accessor.lang === 'EN' ? item.nameen : item.nameth;
    },
    async saveClick() {
      console.log("click: save");
      let valid = await this.validateForm();
      if(!valid) return;
      this.startSaveRecord();
    },
    startSaveRecord() {
      confirmSave(() => { 
        this.saveRecord(this.localData);
      });
    },
    saveRecord(dataRecord) {
      let jsondata = {ajax: true};
      let formdata = serializeParameters(jsondata,dataRecord);
      startWaiting();
      $.ajax({
        url: getApiUrl()+"/api/profile/update",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) { 
          stopWaiting();
          errorThrown = parseErrorThrown(transport, status, errorThrown);
          alertbox(errorThrown);
        },
        success: (data,status,xhr) => { 
          console.log("saveRecord: success : ",xhr.responseText);
          stopWaiting();
          this.saveSuccess(data);
        }
      });			
    },
    saveSuccess(data) {
      console.log("saveSuccess : ",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        successbox(() => {
          this.success();
        });
      }			
    },
    display() {
      this.reset();
      this.retrieve((show) => { if(show) this.focus(); });
    },
    retrieve(callback) {
        console.log("retrieve: info",this.accessor);
        if(this.accessor.info?.userid) {
            this.loadVisible = true;
            //try to get profile info
            let params = {userid: this.accessor.info?.userid};
            let jsondata = {ajax: true};
            let formdata = serializeParameters(jsondata,params);
            startWaiting();
            $.ajax({
              url: getApiUrl()+"/api/profile/get",
              data: formdata.jsondata,
              headers : formdata.headers,
              type: "POST",
              dataType: "json",
              contentType: DEFAULT_CONTENT_TYPE,
              error : function(transport,status,errorThrown) { 
                stopWaiting();
                errorThrown = parseErrorThrown(transport, status, errorThrown);
                alertbox(errorThrown);
              },
              success: (data) => { 
                stopWaiting();
                this.retrieveSuccess(data,callback);
              }
            });			
        }
    },
    retrieveSuccess(data,callback) {
      console.log("ProfileForm.vue: retrieveSuccess",data);
      if(data.head?.errorflag=="Y") {
        alertbox(data.head.errordesc);
      } else {
        this.loadVisible = false;
        if(data.body?.rows?.length >0) {
          this.localData = {...data.body.rows[0]};
          this.infoVisible = true;
          this.notfoundVisible = false;
          if(callback) callback(true);
        } else {
          this.infoVisible = false;
          this.notfoundVisible = true;
          if(callback) callback(false);
        }
      }			
    },
  }
};
</script>
