<template>
  <div class="flex flex-center">
    <div class="confetti" v-if="enter">
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
    </div>
    <Transition
      v-show="enter"
      appear
      style="animation-duration: 3s"
      enter-active-class="animate zoomIn "
      leave-active-class="animate bounceOutUp"
    >
      <div class="next-phonic-unit-button" @click="nextUnit()">
        <strong v-if="!completed_course">Next Unit</strong>
        <strong v-else>Finished!</strong>
      </div>
    </Transition>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

export default defineComponent({
  name: "next-unit",
  components: {},
  props: {
    units: { required: true },
    current_unit: { required: true },
  },
  data() {
    return {
      enter: true,
      completed_course: false,
      next_unit: false,
    };
  },
  mounted() {
    this.next_unit = this.selectNextUnit();
    // console.log("this.next_unit", this.next_unit);
  },
  methods: {
    nextUnit() {
      let vm = this;
      this.enter = false;
      let next_unit = this.next_unit;

      window.setTimeout(function () {
        if (next_unit === false) {
          vm.enter = true;
        } else {
          vm.$emit("nextUnit", next_unit);
        }
      }, 2000);
    },

    selectNextUnit() {
      let next_index =
        this.units.findIndex((e) => e.id === this.current_unit.id) + 1;
      let next_unit = this.units[next_index];

      // console.log("units", this.units);
      // console.log("next_index", next_index);
      if (next_unit !== undefined) {
        return next_unit;
      } else {
        this.completed_course = true;
        return false;
      }
    },
  },
});
</script>

<style>
.next-phonic-unit-button {
  border-radius: 15%;
  box-shadow: inset 0 0 50px #72bcf7;
  padding: 0%;
  margin: 0%;
  width: 20vw;
  height: 20vw;
  font-size: 4vw;
  text-align: center;
  text-justify: center;
  cursor: pointer;
  position: relative;
  background: transparent;
  z-index: 10;
  overflow: hidden;
  text-align: center;
  text-justify: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<style lang="scss">
.confetti {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 5;
}
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 30px;
  background: #ffd300;
  top: 0;
  opacity: 0;
}
.confetti-piece:nth-child(1) {
  left: 7%;
  -webkit-transform: rotate(-40deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 182ms;
  -webkit-animation-duration: 1116ms;
}
.confetti-piece:nth-child(2) {
  left: 14%;
  -webkit-transform: rotate(4deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 161ms;
  -webkit-animation-duration: 1076ms;
}
.confetti-piece:nth-child(3) {
  left: 21%;
  -webkit-transform: rotate(-51deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 481ms;
  -webkit-animation-duration: 1103ms;
}
.confetti-piece:nth-child(4) {
  left: 28%;
  -webkit-transform: rotate(61deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 334ms;
  -webkit-animation-duration: 708ms;
}
.confetti-piece:nth-child(5) {
  left: 35%;
  -webkit-transform: rotate(-52deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 302ms;
  -webkit-animation-duration: 776ms;
}
.confetti-piece:nth-child(6) {
  left: 42%;
  -webkit-transform: rotate(38deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 180ms;
  -webkit-animation-duration: 1168ms;
}
.confetti-piece:nth-child(7) {
  left: 49%;
  -webkit-transform: rotate(11deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 395ms;
  -webkit-animation-duration: 1200ms;
}
.confetti-piece:nth-child(8) {
  left: 56%;
  -webkit-transform: rotate(49deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 14ms;
  -webkit-animation-duration: 887ms;
}
.confetti-piece:nth-child(9) {
  left: 63%;
  -webkit-transform: rotate(-72deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 149ms;
  -webkit-animation-duration: 805ms;
}
.confetti-piece:nth-child(10) {
  left: 70%;
  -webkit-transform: rotate(10deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 351ms;
  -webkit-animation-duration: 1059ms;
}
.confetti-piece:nth-child(11) {
  left: 77%;
  -webkit-transform: rotate(4deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 307ms;
  -webkit-animation-duration: 1132ms;
}
.confetti-piece:nth-child(12) {
  left: 84%;
  -webkit-transform: rotate(42deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 464ms;
  -webkit-animation-duration: 776ms;
}
.confetti-piece:nth-child(13) {
  left: 91%;
  -webkit-transform: rotate(-72deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 429ms;
  -webkit-animation-duration: 818ms;
}
.confetti-piece:nth-child(odd) {
  background: #7431e8;
}
.confetti-piece:nth-child(even) {
  z-index: 1;
}
.confetti-piece:nth-child(4n) {
  width: 5px;
  height: 12px;
  -webkit-animation-duration: 2000ms;
}
.confetti-piece:nth-child(3n) {
  width: 3px;
  height: 10px;
  -webkit-animation-duration: 2500ms;
  -webkit-animation-delay: 1000ms;
}
.confetti-piece:nth-child(4n-7) {
  background: red;
}
@keyframes makeItRain {
  from {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  to {
    -webkit-transform: translateY(350px);
  }
}
</style>
