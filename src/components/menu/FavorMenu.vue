<template>
            <li id="favormenuitem" class="nav-item dropdown user-dropdown" v-show="visible">
                <a href="javascript:void(0)" id="favormenuitemlink" class="nav-link dropdown-item dropdown-toggle" role="button" data-toggle="dropdown" title="My Favorite">
                    <em class="fa fa-th"></em>
                </a>
                <ul id="favordropdownmenu" class="dropdown-menu dropdown-menu-right " aria-labelledby="navbarDropdown">	
                    <li>
                        <div id="favornewitemlayer" class="favor-menu-icon" v-show="newFavorVisible">
                            <a href="javascript:void(0)" @click.stop="cancelNewFavorClick" id="favorcancelitem" class="favor-cancel-item" title="Close New Favorite"><em class="fa fa-times-circle"></em></a>
                            <select id="favorprogitem" v-model="favorProg" @click.stop>
                                <option v-for="(item, index) in favorite.proglists" :key="index" :value="item.programid">{{getDisplayProgramName(item)}}</option>
                            </select>
                            <a href="javascript:void(0)" @click.stop="addFavorItemClick" id="favornewitem" class="favor-new-item fa fa-plus" title="Add New Favorite"></a>
                        </div>
                        <div id="favorbarmenu" class="navbox-tiles">
                            <template v-for="(item,index) in favorite.favorlists" :key="index">
                                <a v-if="item.type == 'new'" href="javascript:void(0)" @click.stop="newFavorItemClick(item)" class="tile fa-box-title fav-blank" title="New Favorite" :seqno="getFavorSeqno(item,index+1)"><div class="icon"><img class="fa fa-app-image img-favor-icon" alt=""/></div><span class="title">Add New</span></a>
                                <a v-else href="javascript:void(0)" @click="openFavorItemClick(item)" class="tile fa-box-title fav-app" :seqno="getFavorSeqno(item,index+1)" :pid="item.programid" :url="item.url" :title="item.programid">
                                    <div class="icon"><img class="fa fa-app-image" :src="getFavorIcon(item)" alt=""/></div><span class="title">{{ getDisplayFavorName(item) }}</span>
                                    <ul class="todo"><li @click.stop="deleteFavorItemClick(item,index+1)"><img class='img-delete-icon' title="Delete" width="25px" height="25px"/></li></ul>
                                </a>
                            </template>
                        </div>
                        <div id="favorcoverbarmenu" class="favor-menu-cover" v-show="newFavorVisible"></div>
                    </li>
                </ul>
            </li>
</template>
<style>
a.tile.fa-box-title.fav-app .todo { display: none; }
a.tile.fa-box-title.fav-app:hover .todo { display: block; }
</style>
<script>
import $ from "jquery";
import { ref } from 'vue';
import { getApiUrl, getImgUrl, DEFAULT_CONTENT_TYPE } from "@willsofts/will-app";
import { submitFailure, serializeParameters } from "@willsofts/will-app";
import { openPage } from "@/assets/js/login.util.js";
import { accessor } from "@/assets/js/accessor.js";
import { favorite } from "@/assets/js/favorite.js";

export default {
  props: {
    visible: {
      type: [String,Boolean],
      default: true,
    },
  },
  setup() {
    const newFavorVisible = ref(false);
    const favorProg = ref(null);
    const currentFavor = ref(null);
    return { accessor, favorite, newFavorVisible, favorProg, currentFavor };
  },
  methods: {
    reset() {
        console.log("FavorMenu.vue: reset ...");
        this.favorite.reset();
    },
    getFavorIcon(item) {
        return item.iconfile && item.iconfile.trim().length > 0 ? getImgUrl()+"/img/apps/"+item.iconfile : this.getDefaultFavorIcon(item);
    },
    getFavorSeqno(item,index) {
        return item.seqno ? item.seqno : index;
    },
    getDefaultFavorIcon(item) {
        return item.type=='new' ? getImgUrl()+"/img/apps/favorite.png" : getImgUrl()+"/img/apps/application.png";
    },
    getDisplayFavorName(item) {
        return this.accessor.lang === 'EN' ? item.shortname : item.shortnameth;
    },
    getDisplayProgramName(item) {
        return this.accessor.lang === 'EN' ? item.shortname : item.shortnameth;
    },
    setting() {
        console.log("FavorMenu: setting, accessor",this.accessor);
        this.loadFavorMenu();
        this.loadProgramItems();
    },
    loadFavorMenu() {
        console.log("loadFavorMenu: accessor",this.accessor);
        let info = this.accessor.info;
        let access_user = info?.userid;
        if(!access_user || access_user.trim().length==0) return;
        let language = this.accessor.lang;
        let params = { userid: access_user, language: language };
        let formdata = serializeParameters(params);
        $.ajax({
            url: getApiUrl()+"/api/menu/favor",
            data: formdata.jsondata,
            headers : formdata.headers,
            type: "POST",
            dataType: "json",
            contentType: DEFAULT_CONTENT_TYPE,
            success: (data) => { 
                console.log("loadFavorMenu: success",data);
                let dataset = data.body?.dataset;
                if(dataset) {
                    let rows = dataset.rows;
                    if(rows) {
                        for(let idx = rows.length + 1; idx <= 9; idx++) {
                            rows.push({type:"new", seqno: idx});
                        }
                        this.favorite.setFavorLists(rows);
                    }
                }
            }
        });
    },
    loadProgramItems() {
        console.log("loadProgramItems: accessor",this.accessor);
        let access_user = this.accessor.info?.userid;
        if(!access_user || access_user.trim().length==0) return;
        let formdata = serializeParameters({ userid: access_user });
        $.ajax({
            url: getApiUrl()+"/api/menu/favorprog",
            data: formdata.jsondata,
            headers : formdata.headers,
            type: "POST",
            dataType: "json",
            contentType: DEFAULT_CONTENT_TYPE,
            success: (data) => { 
                console.log("loadProgramItems: success",data);
                if(data.body?.rows) {
                    this.favorite.setProgLists(data.body.rows);
                }
            },
        });	
    },
    cancelNewFavorClick() {
        this.newFavorVisible = false;
    },
    addFavorItemClick() {
        console.log("addFavorItem: current favor",this.currentFavor);
        console.log("addFavorItem: favor prog",this.favorProg);
        if(this.currentFavor && this.favorProg) {
            let prog = this.favorite.proglists.find((item) => item.programid == this.favorProg);
            console.log("addFavorItem: prog item",prog);
            if(!prog) return;
            let fs_user = this.accessor.info?.userid;
            let fs_prog = prog.programid;
            let fs_seqno = this.currentFavor.seqno;
            let params = { userid: fs_user, programid: fs_prog, seqno: fs_seqno };
            let formdata = serializeParameters(params);
            $.ajax({
                url: getApiUrl()+"/api/menu/insert",
                data: formdata.jsondata,
                headers : formdata.headers,
                type: "POST",
                dataType: "html",
                contentType: DEFAULT_CONTENT_TYPE,
                error : function(transport,status,errorThrown) { 
                    submitFailure(transport,status,errorThrown,false);  
                },
                success: () => { 
                    Object.assign(this.currentFavor,prog);
                    this.currentFavor.type = "add";
                    this.newFavorVisible = false;
                },
            });	
        }
    },
    newFavorItemClick(item) {
        console.log("newFavorItem: item",item);
        this.currentFavor = item;
        this.newFavorVisible = true;
    },
    openFavorItemClick(item) {
        console.log("openFavorItem: item",item);
        openPage(item,this.accessor,this.favorite);
    },
    deleteFavorItemClick(item,index) {
        console.log("deleteFavorItem: item",item);
        let fs_user = this.accessor.info?.userid;
        let fs_seqno = item.seqno ? item.seqno : index;
        let params = { userid: fs_user, programid: item.programid, seqno: fs_seqno };
        let formdata = serializeParameters(params);
		$.ajax({
			url: getApiUrl()+"/api/menu/remove",
            data: formdata.jsondata,
            headers : formdata.headers,
			type: "POST",
			dataType: "html",
			contentType: DEFAULT_CONTENT_TYPE,
			error : function(transport,status,errorThrown) { 
				submitFailure(transport,status,errorThrown,false);  
			},
            success: () => { 
                item.type = "new";
            },
		});
    },
  },
};
</script>
