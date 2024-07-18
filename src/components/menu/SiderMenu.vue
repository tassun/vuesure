<template>
<ul id="menuitemlist" class="nav flex-column sidebar-nav navbar-nav list-sidebar bg-default" role="menu">
    <li class="dropdown" v-for="(value,key,counter) in menus.sidemap" :key="key">
        <a @click="$emit('group-menu-selected', value)" class="nav-menu-group dropdown-toggle collapsed active" data-toggle="collapse" :data-target="'#submenu_'+counter" :href="'javascript:void(0);#submenu_'+counter">
            <em :class="getDisplayGroupStyle(value)"></em>&nbsp;
            <span class="nav-label">{{ getDisplayGroupName(value) }}</span>
            <span class="menu-group-icon fa fa-chevron-left pull-right"></span>
        </a>
        <ul :id="'submenu_'+counter" class="sub-menu panel-collapse collapse" role="menu">
            <li v-for="(item,index) in menus.sidelist[key]" :key="index">
                <a href="javascript:void(0)" @click="itemMenuSelected(item)" class="fa-link-menu-item menu-desktop" :class="item.iconstyle" :data-pid="item.programid" :data-url="item.url" :title="item.programid">{{ getDisplayProgramName(item) }}</a>
            </li>
        </ul>
    </li>
</ul>
</template>
<script>
export default {
  props: {
    menus: Object,    
    lang: String,
  },
  emits: ["group-menu-selected","item-menu-selected"],
  methods: {
    getDisplayGroupStyle(item) {
        return item.groupstyle && item.groupstyle.trim().length > 0 ? item.groupstyle : "fa fa-tasks";
    },
    getDisplayGroupName(item) {
        return this.$props.lang === 'EN' ? item.nameen : item.nameth;
    },
    getDisplayProgramName(item) {
        return this.$props.lang === 'EN' ? item.progname : item.prognameth;
    },
    itemMenuSelected(item) {
        console.log("SideMenu.vue: menu item selected",item);
        this.$emit("item-menu-selected", item);
    },
  },
};
</script>
