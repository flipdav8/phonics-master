<template>
  <span class="show_borders text-transparent">
    <div class="absolute invisible" :id="`auto-${letters}`">
      {{ letters }}
    </div>
    <div :key="grow" class="auto-grow-letters">{{ letters }}</div>
  </span>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "word-letters",
  components: {
    // PhonicOptions
  },
  props: {
    letters: {},
    grow: {},
    speed: {},
  },
  data() {
    return {
      mounted: false,
      from_width: "0px",
      to_width: "100px",
      auto_speed: "0.5s",
    };
  },
  mounted() {
    if (this.speed !== undefined) {
      this.auto_speed = this.speed;
    }
    this.$nextTick(function () {
      const width = document.getElementById(`auto-${this.letters}`).offsetWidth;
      // this.from_width = width + "px";
      // console.log("grow", this.grow);
      // console.log("width", width);
      if (this.grow) {
        this.from_width = "0px";
        this.to_width = width + "px";
      } else {
        this.from_width = width + "px";
        this.to_width = "0px";
      }
    });

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

.auto-grow-letters {
  display: inline-block;
  border-radius: 2vw;
  background: transparent;
  border-left: dotted 0px rgba(255, 255, 255, 0.1);
  border: dotted 0px rgba(255, 255, 255, 0.1);
  white-space: none;
  animation-name: auto_grow;
  animation-duration: v-bind(auto_speed);
  animation-timing-function: ease-in-out;
  animation-direction: forwards;
  animation-fill-mode: forwards;
}

@keyframes auto_grow {
  from {
    width: v-bind(from_width);
  }
  to {
    width: v-bind(to_width);
  }
}
</style>
