<template>
<div id="blanklayer">{{ labels.system_label }}</div>
</template>
<script setup>
import { defineProps, onActivated } from 'vue';
    defineProps({
        labels: Object
    });

    onActivated(() => {
        console.log("BlankForm.vue: onActivated ... ");
        this.$emit("activated","blank");
    });

</script>
