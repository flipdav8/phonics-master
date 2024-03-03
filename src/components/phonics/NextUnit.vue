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
    data: { required: true },
    next_unit_ready: { required: true },
  },
  data() {
    return {
      enter: true,
      completed_course: false,
      next_unit: false,
      next_index: null,
      next_info: null,
    };
  },
  mounted() {
    this.next_unit = this.findNextUnit();

    this.next_info = {
      unit: this.next_unit, // will change later.. ?
      unit_index: this.next_index,
    };
    this.$emit("nextUnitInformation", this.next_info);
    // console.log("this.next_unit", this.next_unit);
  },
  methods: {
    nextUnit() {
      if (!this.next_unit_ready) return;

      let vm = this;
      this.enter = false;
      let next_unit = this.next_unit;

      window.setTimeout(function () {
        if (next_unit === false) {
          vm.enter = true;
        } else {
          vm.$emit("nextUnit", vm.next_info);
        }
      }, 2000);
    },

    findNextUnit() {
      // let nonpass_units = this.units.filter(e => !e.pass);
      // let next_index =
      //   this.units.findIndex((e) => e.id === this.current_unit.id) +
      //   1;

      // console.log("this.data", this.data);
      const data = this.data;
      let next_index = this.units.findIndex(
        (e) =>
          (data[e.id] == undefined || !data[e.id].pass) &&
          e.id !== this.current_unit.id
      );
      let next_unit = this.units[next_index];
      this.next_index = next_index;
      // console.log("units", this.units);
      // console.log("next_index", next_index);
      if (next_unit !== undefined) {
        return next_unit;
      } else {
        this.next_index = null;
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
  transform: rotate(-40deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 182ms;
  animation-duration: 1116ms;
  -webkit-transform: rotate(-40deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 182ms;
  -webkit-animation-duration: 1116ms;
}
.confetti-piece:nth-child(2) {
  left: 14%;
  transform: rotate(4deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 161ms;
  animation-duration: 1076ms;
  -webkit-transform: rotate(4deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 161ms;
  -webkit-animation-duration: 1076ms;
}
.confetti-piece:nth-child(3) {
  left: 21%;
  transform: rotate(-51deg);
  -webkit-transform: rotate(-51deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 481ms;
  animation-duration: 1103ms;
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 481ms;
  -webkit-animation-duration: 1103ms;
}
.confetti-piece:nth-child(4) {
  left: 28%;
  transform: rotate(61deg);
  -webkit-transform: rotate(61deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 334ms;
  animation-duration: 708ms;
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 334ms;
  -webkit-animation-duration: 708ms;
}
.confetti-piece:nth-child(5) {
  left: 35%;
  transform: rotate(-52deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 302ms;
  animation-duration: 776ms;
  -webkit-transform: rotate(-52deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 302ms;
  -webkit-animation-duration: 776ms;
}
.confetti-piece:nth-child(6) {
  left: 42%;
  transform: rotate(38deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 180ms;
  animation-duration: 1168ms;
  -webkit-transform: rotate(38deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 180ms;
  -webkit-animation-duration: 1168ms;
}
.confetti-piece:nth-child(7) {
  left: 49%;
  transform: rotate(11deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 395ms;
  animation-duration: 1200ms;
  -webkit-transform: rotate(11deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 395ms;
  -webkit-animation-duration: 1200ms;
}
.confetti-piece:nth-child(8) {
  left: 56%;
  transform: rotate(49deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 14ms;
  animation-duration: 887ms;
  -webkit-transform: rotate(49deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 14ms;
  -webkit-animation-duration: 887ms;
}
.confetti-piece:nth-child(9) {
  left: 63%;
  transform: rotate(-72deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 149ms;
  animation-duration: 805ms;
  -webkit-transform: rotate(-72deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 149ms;
  -webkit-animation-duration: 805ms;
}
.confetti-piece:nth-child(10) {
  left: 70%;
  transform: rotate(10deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 351ms;
  animation-duration: 1059ms;
  -webkit-transform: rotate(10deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 351ms;
  -webkit-animation-duration: 1059ms;
}
.confetti-piece:nth-child(11) {
  left: 77%;
  transform: rotate(4deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 307ms;
  animation-duration: 1132ms;
  -webkit-transform: rotate(4deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 307ms;
  -webkit-animation-duration: 1132ms;
}
.confetti-piece:nth-child(12) {
  left: 84%;
  transform: rotate(42deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 464ms;
  animation-duration: 776ms;
  -webkit-transform: rotate(42deg);
  -webkit-animation: makeItRain 1000ms infinite ease-out;
  -webkit-animation-delay: 464ms;
  -webkit-animation-duration: 776ms;
}
.confetti-piece:nth-child(13) {
  left: 91%;
  transform: rotate(-72deg);
  -webkit-transform: rotate(-72deg);
  animation: makeItRain 1000ms infinite ease-out;
  animation-delay: 429ms;
  animation-duration: 818ms;
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
  animation-duration: 2000ms;
  -webkit-animation-duration: 2000ms;
}
.confetti-piece:nth-child(3n) {
  width: 3px;
  height: 10px;
  animation-duration: 2500ms;
  animation-delay: 1000ms;
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
