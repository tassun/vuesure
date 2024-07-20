<template>
<div id="blanklayer"></div>
</template>
<script>
import { onActivated } from 'vue';

export default {
  props: {
    labels: Object,
  },
  setup(props,context) {
    let onactivated = onActivated(() => {
        console.log("BlankForm.vue: onActivated ... ");
        context.emit("activated","blank");
    });
    return { onactivated };
  },
};
</script>
