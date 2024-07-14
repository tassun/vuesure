import $ from "jquery"
import { startWaiting, stopWaiting, openNewWindow, submitWindow, submitFailure }  from '@/assets/js/apputil.js'
import { getApiUrl, getBaseUrl, getCdnUrl, getDefaultLanguage,  DEFAULT_CONTENT_TYPE } from "@/assets/js/appinfo";
import { getAccessorToken, removeAccessorInfo, getAccessorInfo, saveAccessorInfo, getStorage, removeStorage, setupDiffie } from "@/assets/js/messenger";

var $currPage;
export function closeMenuBar() {
    let menubar = $("#sidebarmenu");
    if(menubar.is(":visible")) {
      $("#mainmenutrigger").addClass("active-trigger");
      $('#sidebarmenu').removeClass('unfliph').addClass("fliph");
      $("#sidebarheader").hide();
    }
}
export function showMenuBar() {
    let menubar = $("#sidebarmenu");
    if(!menubar.is(":visible")) {
      menubar.removeClass("sidebar-hide"); 
      $("#mainmenutrigger").removeClass("active-trigger");
      $('#sidebarmenu').removeClass("fliph").addClass("unfliph");
      $("#sidebarheader").show();
    }
}
export function loadPage(appid,params,callback,lang,info) {	
	if(!$currPage || $currPage=="") {
		$currPage = $("#page_0");
	}	
	$currPage.hide();
	$currPage.removeClass("pt-page-current pt-page-moveFromRight pt-page-moveFromLeft");	
	closeMenuBar();
	loadApplication(appid,params,callback,lang,info);
	$("#pagecontainer").show();
	$("#workingframe").hide();
}
function loadApplication(appid,params,callback,lang,info) {
	let fs_useruuid = info?.useruuid;
	let fs_user = info?.userid;
	let appurl = getBaseUrl()+"/gui/"+appid; 
	console.log("loadApplication: url",appurl);
	let prm = { useruuid: fs_useruuid, userid: fs_user, language: lang };
	if(params) {
		let pr = params.split("&");
		for(let i=0;i<pr.length;i++) {
			let kary = pr[i].split("=");
			prm[kary[0]] = kary[1];
		}
	}
	console.log("loadApplication: prm",prm);
	let authtoken = getAccessorToken();
	startWaiting();
	$.ajax({
		url: appurl,
		data: prm,
		headers : { "authtoken": authtoken },
		type: "POST",
		dataType: "html",
		contentType: DEFAULT_CONTENT_TYPE,
		error : function(transport) { 
			stopWaiting();
			let txt = transport.responseText;
			let $div = $("<div class='protection-error'></div>").html(txt);
			$("#pagecontainer").html($div);
		},
		success: (data) => { 
			stopWaiting();
			$("#pagecontainer").html(data);
			showCurrentPage();
			if(callback) callback();
		}
	});	
}
export function showCurrentPage() {
	$currPage = $("#pagecontainer").show().children("div").eq(0);
	$currPage.addClass("pt-page-current pt-page-moveFromRight");
	$currPage.show();
}
export function openPage(appid,url,params,apath) {
	console.log("open_page(appid="+appid+",url="+url+",params="+params+",path="+apath+")");
	let fs_newflag = "1"==$("#accessor_label").data("NEW");
	if(!fs_newflag) {
		if(!$currPage || $currPage==""){
			$currPage = $("#page_0");
		}	
		$currPage.hide();
		$currPage.removeClass("pt-page-current pt-page-moveFromRight pt-page-moveFromLeft");	
		closeMenuBar();
		$("#languagemenuitem").hide();
	}
	openProgram(appid,url,params,apath);
}
const except_apps = ["page_profile","page_change","page_first","page_login","page_work","page_forgot"];
export function openProgram(appid,url,params,apath) {
	let fs_newwindows = "1"==$("#accessor_label").data("NEW");
	console.log("openProgram(appid="+appid+", path="+apath+", url="+url+", params="+params+")");
	if(!apath) apath = getBaseUrl();
	let appurl = apath+"/gui/"+appid; //+"?seed="+Math.random()+(params?"&"+params:"");
	if(url && url.trim().length > 0) {
		appurl = getBaseUrl()+"/load/"+appid; //+"?seed="+Math.random()+(params?"&"+params:"");
	}
	console.log("openProgram: appurl",appurl);
	$("#page_login").hide();
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
	recentApplication(appid,url,params);
}
function recentApplication(appid,url,params) {
	let $rlist = $("#recentmenulist");
	let $items = $rlist.find("li");
	if($items.length>15) return;
	let found = false;
	$(except_apps).each(function(idx,elem) { if(elem==appid) { found = true; return false; } });	
	$items.each(function(idx,elem) { if($(elem).attr("appid")==appid) { found = true; return false; }});
	if(found) return;	
	let authtoken = getAccessorToken();
	$.ajax({
		url: getApiUrl()+"/api/apps/find",
		data: { programid: appid },
		headers : { "authtoken": authtoken },
		type: "POST",
		dataType: "html",
		contentType: DEFAULT_CONTENT_TYPE,
		success: (data) => { 
			let json = JSON.parse(data);
			if(json && json.body.rows.length>0) {
				let row = json.body.rows[0];
				let $li = $("<li></li>");
				let $alink = $("<a href='javascript:void(0)'></a>");
				$alink.on("click",function() { openPage(appid,url,params); }).html(row["description"]);
				$li.append($alink).attr("appid",appid).attr("url",url).appendTo($rlist);	
				$("#recentcaret").show();
			}
		}
	});
}
export function gotoHomePage() {
	showCurrentPage();
	$("#languagemenuitem").show();
	hideWorkSpace();
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
	hideNewFavorItem();
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
export function verifyAfterLogin(json,callback) {
	$("#fsworkinglayer").addClass("working-control-class");
	if(json.body.factorverify && json.body.factorid!="" && (json.body.factorcode==undefined || json.body.factorcode=="")) {
		$("#fsworkinglayer").removeClass("working-control-class");
		openPage("factor",null,"factorid="+json.body.factorid);			
	} else {
		if(json.body.changeflag && json.body.changeflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage("page_change",null,"changed=force");
		} else if(json.body.expireflag && json.body.expireflag=="1") {
			$("#fsworkinglayer").removeClass("working-control-class");
			openPage("page_change",null,"changed=expire");
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


var fs_current_favor_item;
export function showNewFavorItem() {
	$("#favorcoverbarmenu").show();
	$("#favornewitemlayer").show();
}
export function hideNewFavorItem() {
	$("#favorcoverbarmenu").hide();
	$("#favornewitemlayer").hide();
}
export function addBlankMenuItem(alink) {
	let seqno = alink.attr("seqno");
	let $blank = $("<a href=\"javascript:void(0);\" class=\"tile fa-box-title fav-blank\" title=\"New Favorite\" seqno=\""+seqno+"\"><div class=\"icon\"><img class=\"fa fa-app-image\" src=\""+getCdnUrl()+"/img/apps/fs_icon.png\" /></div><span class=\"title\">Add New</span></a>");
	$blank.on("click",function(evt) { 
		evt.stopPropagation();
		fs_current_favor_item = $(this);
		showNewFavorItem();
	});
	$blank.insertBefore(alink);
}
export function setupOpenLink(alink) {
	let pid = alink.attr("pid");
	let url = alink.attr("url");
	if(pid && pid!="") alink.on("click",function() { openPage(pid,url,null,null,alink); });
}
export function setupTodo(alink,info) {
	let $del = $("<li><img class='img-delete-icon' title=\"Delete\" width=\"25px\" height=\"25px\"/></li>");
	$del.on("click",(evt) => { 
		evt.stopPropagation();
		let fs_user = info?.userid;
		let fs_seqno = alink.attr("seqno");
		let fs_prog = alink.attr("pid");
		console.log("delete favor: seqno="+fs_seqno+", prog="+fs_prog+", user="+fs_user);
		if(fs_prog && fs_prog!="") {
			let authtoken = getAccessorToken();
			$.ajax({
				url: getApiUrl()+"/api/menu/remove",
				type: "POST",
				data: { userid: fs_user, programid: fs_prog, seqno: fs_seqno },
				headers : { "authtoken": authtoken },
				dataType: "html",
				contentType: DEFAULT_CONTENT_TYPE,
				error : function(transport,status,errorThrown) { 
					submitFailure(transport,status,errorThrown);  
				},
			});	
		}
		addBlankMenuItem(alink);
		alink.remove(); 
	});
	let $item = $("<ul class=\"todo\" style=\"display:none;\"></ul>").append($del);
	alink.append($item);
	alink.hover(function() { 
			$item.show();
		},function() { 
			$item.hide();
	});
}
export function insertNewFavorMenuItem(info,alink,fs_prog,fs_title,fs_icon) {
	if(!fs_prog || !fs_title || !fs_icon) return;
	let fs_seqno = alink.attr("seqno");
	let fs_user = info?.userid;
	console.log("insertNewFavorMenuItem: seqno="+fs_seqno+", alink",alink);
	let $newlink = $("<a href=\"javascript:void(0);\" class=\"tile fa-box-title fav-app\" pid=\""+fs_prog+"\" seqno=\""+fs_seqno+"\"><div class=\"icon\"><img class=\"fa fa-app-image\" src=\""+getCdnUrl()+"/img/apps/"+fs_icon+"\" /></div><span class=\"title\">"+fs_title+"</span></a>");
	if(fs_prog && fs_prog!="") {
		let authtoken = getAccessorToken();
		$.ajax({
			url: getApiUrl()+"/api/menu/insert",
			type: "POST",
			data: { userid: fs_user, programid: fs_prog, seqno: fs_seqno },
			headers : { "authtoken": authtoken },
			dataType: "html",
			contentType: DEFAULT_CONTENT_TYPE,
			error : function(transport,status,errorThrown) { 
				submitFailure(transport,status,errorThrown);  
			},
			success: function() { 
				$newlink.insertBefore(alink);
				setupOpenLink($newlink);
				setupTodo($newlink,info);
				alink.remove();
			}
		});	
	}
}
export function bindingOnFavorMenu(info) {
	$("a",$("#favorbarmenu")).each(function(index,element) { 
		let alink = $(element);
		if(!alink.is(".fav-app")) {
			alink.on("click",function(evt) { 
				evt.stopPropagation();
				fs_current_favor_item = alink;
				showNewFavorItem();
			});						
		} else {
			setupOpenLink(alink);
			setupTodo(alink,info);
		}
	});
}			
export function addNewFavorMenuItem(title,evt) {
	let favorbar = $("#favorbarmenu");
	let len = favorbar.find("a").length;
	if(len>14) favorbar.find("a:eq(0)").remove();
	let $newlink = $("<a href=\"javascript:void(0);\" class=\"tile fa-box-title\"><div class=\"icon\"><i class=\"fa fa-university\"></i></div><span class=\"title\">"+title+"</span></a>");
	favorbar.append($newlink);
	if(evt) evt.stopPropagation();
	if(!$("#favormenuitem").is(".open")) $("#favormenuitemlink").trigger("click");
}
export function setupNewFavorItem(info) {
	if(fs_current_favor_item) {
		let fs_prog = $("#favorprogitem").val();
		let fs_title = $("option:selected",$("#favorprogitem")).text();
		let fs_icon = fs_prog+".png";
		insertNewFavorMenuItem(info,fs_current_favor_item,fs_prog,fs_title,fs_icon);
	}
}
