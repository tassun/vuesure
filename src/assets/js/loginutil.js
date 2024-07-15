import $ from "jquery"
import { startWaiting, openNewWindow, submitWindow }  from '@/assets/js/apputil.js'
import { getApiUrl, getBaseUrl, getDefaultLanguage,  DEFAULT_CONTENT_TYPE } from "@/assets/js/appinfo";
import { getAccessorToken, removeAccessorInfo, getAccessorInfo, saveAccessorInfo, getStorage, removeStorage, setupDiffie } from "@/assets/js/messenger";

export function openPage(app,accessor,favorite) {
	openProgram(app,accessor,favorite);
}
const except_apps = ["page_profile","page_change","page_first","page_login","page_work","page_forgot","factor"];
export function openProgram(app,accessor,favorite) {
	console.log("openProgram:",app);
	console.log("openProgram: accessor",accessor);
	let fs_newwindows = "1" == accessor?.info?.newflag;
	let appid = app.programid;
	let url = app.url;
	let params = app.parameters;
	let apath = app.progpath;
	let appurl = getBaseUrl() + "/gui/" + appid; 
	if(apath && apath.trim().length >0) {
		appurl = getBaseUrl() + apath;
	}
	if(url && url.trim().length > 0) {
		//appurl = getBaseUrl()+"/load/"+appid; 
		appurl = url + "/" + appid;
		if(apath && apath.trim().length >0) {
			appurl = url + apath;
		}
	}
	console.log("openProgram: app url",appurl);
	let authtoken = getAccessorToken();
	if(fs_newwindows) {
		let awin = openNewWindow({
			url : appurl,
			windowName: "fs_window_"+appid,
			params: "authtoken="+authtoken+"&language="+getDefaultLanguage()+(params?"&"+params:"")
		});
		awin.focus();
	} else {
		$("#pagecontainer").hide();
		$("#workingframe").show();
		submitWindow({
			url : appurl,
			windowName: "workingframe",
			params: "authtoken="+authtoken+"&language="+getDefaultLanguage()+(params?"&"+params:"")
		});
		startWaiting();
	}
	recentApplication(app,favorite);
}
function recentApplication(app,favorite) {
	console.log("recentApplication:",app);
	console.log("favorite",favorite);
	if(!favorite) return;
	let appid = app.programid;
	if(favorite.recentlists.length > 12) return;
	if(except_apps.some((item) => item.programid == appid )) return;
	if(favorite.recentlists.some((item) => item.programid == appid )) return;
	favorite.recentlists.push({...app});
}
export function hideWorkSpace() {
	$("#workingframe").hide();
	window.open(getBaseUrl()+"/blank.html","workingframe");
} 
export function hideWorkingFrame() {
	hideWorkSpace();
}
export function forceLogout(info) {
	let useruuid = info?.useruuid;
	let authtoken = getAccessorToken();
	console.log("useruuid="+useruuid+", authtoken="+authtoken);
	$.ajax({ url : getApiUrl()+"/api/sign/signout", data: { useruuid: useruuid }, headers : { "authtoken": authtoken }, type : "POST" });
}
export function logOut(info) {
	forceLogout(info);
	doLogout();
}
export function doLogout() {
	removeAccessorInfo();
	doLogin();
	clearAvatar();
}
export function clearAvatar() {
	$("#avatarimage").addClass("img-avatar");
}
export function loggingIn() {
	hideWorkingFrame();
	$("#page_login").show();
}
export function doLogin() {
	loggingIn();
	hideWorkSpace();
	$("#languagemenuitem").addClass("language-menu-item").show();
	$("#recentmenulist").empty();
}		
export function refreshScreen() {
	$(window).trigger("resize");
}
export function validAccessToken(callback) {
	let json = getAccessorInfo();
	if(json && json.authtoken) {
		doAccessToken(json.authtoken,callback,json.info);
		return;
	}
	if(callback) callback(false);
}
export function doAccessToken(token,callback,info) {
	if(token && token.trim().length>0) {
		$.ajax({
			url: getApiUrl()+"/api/sign/accesstoken",
			headers : { "authtoken": token },
			type: "POST",
			contentType: DEFAULT_CONTENT_TYPE,
			dataType: "html",
			error : function() {
				if(callback) callback(false); 
			},
			success: function(data){ 
				accessSuccess(data,callback,info);
			}
		});	
		return;
	}		
	if(callback) callback(false); 
}
export function accessSuccess(data,callback,info) {
	console.log("accessSuccess : ",data);
	try {
		let json = JSON.parse(data);
		if(json && json.head.errorflag=="N") {
			if(info) json.body.info = info;
			console.log("accessSuccess: body",json.body);
			saveAccessorInfo(json.body);
			let accessToken = getStorage("access_token");
			if(accessToken) setupDiffie(json);
			removeStorage("access_token");
			if(callback) callback(true,json); 
			return;
		}
	} catch(ex) { console.error(ex); }
	if(callback) callback(false); 
}	
export function verifyAfterLogin(json,callback,accessor,favorite) {
	$("#fsworkinglayer").addClass("working-control-class");
	if(json.body.factorverify && json.body.factorid!="" && (json.body.factorcode==undefined || json.body.factorcode=="")) {
		$("#fsworkinglayer").removeClass("working-control-class");
		openPage({programid: "factor", parameters: "factorid="+json.body.factorid},accessor,favorite);
	} else {
		if(json.body.changeflag && json.body.changeflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage({programid: "page_change", parameters: "changed=force"},accessor,favorite);
		} else if(json.body.expireflag && json.body.expireflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage({programid: "page_change", parameters: "changed=expire"},accessor,favorite);
		} else {
			doAfterLogin(json);
			if(callback) callback();
		}
	}
}
export function doAfterLogin(json) {
	if(json) {
		let avatar = json.body.avatar;
		if(avatar && avatar.trim().length > 0) {
			$("#avatarimage").removeClass("img-avatar").attr("src",avatar);
		}
	}
}
