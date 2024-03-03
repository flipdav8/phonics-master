<template>
  <div class="flex row justify-end full-width">
    <div
      class="phonics-secondary-btn phonics-primary-color self-end q-mr-md hiddens"
      @click="$emit('go')"
    >
      <div class="phonics-secondary-btn--inner">go</div>
      <q-tooltip>Submit Word</q-tooltip>
    </div>

    <!-- <div
      v-if="$q.platform.is.mobile"
      class="absolute"
      style="bottom: 10px; right: 10px"
    >
      <div class="phonics-go-helper" @click="$emit('go')">
        <div class="phonics-go">go</div>
      </div>
    </div> -->
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "go-button",
  components: {
    // PhonicOptions
  },
  props: {
    //
  },
  data() {
    return {
      mounted: false,
    };
  },
  mounted() {
    this.mounted = true;
  },

  computed: {
    //
  },

  methods: {
    //
  },
});
</script>
<style></style>
