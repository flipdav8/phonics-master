<template>
  <div
    class="animated"
    style="animation-duration: 0.5s"
    :class="{ slideInDown: enter, slideOutDown: !enter }"
  >
    <div
      :class="{
        'word-letters-3': correct === null && letters.length === 3,
        'word-letters-4': correct === null && letters.length > 3,
      }"
    >
      <div v-if="letters != null">
        <span v-if="letters.includes('-')">
          <span v-if="correct || correct === 'corrected'">
            {{ letters.split("-")[0] }}
          </span>
          <span v-else>
            {{ letters }}
          </span>
        </span>
        <span v-else> {{ letters }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "phonic-letters",
  components: {
    // PhonicOptions
  },
  props: {
    letters: { required: true },
    correct: { required: true },
    exit: {},
  },
  data() {
    return {
      mounted: false,
      enter: true,
    };
  },
  mounted() {
    if (this.exit) {
      this.enter = false;
    }
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
<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
