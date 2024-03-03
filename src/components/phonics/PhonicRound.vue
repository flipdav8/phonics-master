<template>
  <div class="flex flex-center">
    <Transition
      v-show="enter"
      appear
      style="animation-duration: 3s"
      enter-active-class="animate zoomIn "
      leave-active-class="animate bounceOutUp"
    >
      <div @click="nextRound()">
        <!-- <div class="text-h5">Round {{ rounds }} complete!</div> -->
        <div class="round-phonic-unit-button">Continue to next round</div>
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
  name: "phonic-round",
  components: {},
  props: {
    rounds: {},
    look_at_data: {},
  },
  data() {
    return {
      enter: true,
    };
  },
  mounted() {
    this.look();
  },
  methods: {
    nextRound() {
      this.$emit("nextRound");
    },

    look() {
      //
    },
  },
});
</script>

<style>
.round-phonic-unit-button {
  border-radius: 15%;
  box-shadow: inset 0 0 50px #72bcf7;
  padding: 0%;
  margin: 0%;
  width: 20vw;
  height: 20vw;
  font-size: 3vw;
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
