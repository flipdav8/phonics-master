<template>
  <div
    v-if="select_unit != null"
    class="fit text-center"
    style="animation-duration: 3s"
  >
    <!-- <div class="absolute z-max" style="bottom: 0px">
      <q-btn @click="test()">test</q-btn>
    </div> -->

    <div v-if="unit_passed || word == null" class="fit">
      <NextUnit
        class="fit"
        v-if="!revision_mode"
        :units="units"
        :current_unit="select_unit"
        :data="look_at_data"
        :next_unit_ready="next_unit_ready"
        @nextUnit="nextUnit"
        @nextUnitInformation="(e) => $emit('nextUnitInformation', e)"
      ></NextUnit>
      <div v-else>
        <div class="text-h5">Well Done!</div>
        <q-btn size="lg" color="green" no-caps @click="$emit('overview')"
          >Back To Dashboard</q-btn
        >
      </div>
    </div>

    <div v-else-if="round_pitstop" class="fit">
      <div v-if="quick_mode">
        <div class="text-h5">Well Done!</div>
        <q-btn size="lg" color="green" no-caps @click="$emit('overview')">
          Back To Dashboard
        </q-btn>
        <!-- {{ look_at_data.points }} -->
      </div>
      <PhonicRound
        v-else
        class="fit"
        @nextRound="nextRound"
        :look_at_data="look_at_data[select_unit.id]"
        :rounds="rounds"
        :quick_mode="quick_mode"
      ></PhonicRound>
    </div>

    <!-- :key="word.id + '-' + next_key + '-' + past" -->
    <PhonicsWord
      ref="word"
      v-else-if="word !== null"
      class="fit"
      :word="word"
      :blocks="phonic_options"
      :mode="mode"
      :look_at_data="look_at_data[select_unit.id]"
      :target="target"
      @next="next()"
      @isCorrect="isCorrect"
      @isIncorrect="isIncorrect"
    ></PhonicsWord>
    <!-- {{ student_data.points }} -->
    <!-- {{ student_data.consecutive }} -->
  </div>
</template>

<script>
import { defineComponent } from "vue";
import PhonicsWord from "./PhonicsWord.vue";
import NextUnit from "./NextUnit.vue";
import PhonicRound from "./PhonicRound.vue";

export default defineComponent({
  props: {
    select_unit: { required: true },
    unit_passed: { required: true },
    word: { required: true },
    revision_mode: { required: true },
    units: { required: true },
    look_at_data: { required: true },
    round_pitstop: { required: true },
    quick_mode: { required: true },
    rounds: { required: true },
    phonic_options: { required: true },
    target: { required: true },
    mode: { required: true },
    past: { default: false },
    next_unit_ready: { default: false },
  },
  components: { PhonicsWord, NextUnit, PhonicRound },
  setup() {
    //
  },
  data() {
    return {
      next_key: 0,
    };
  },
  mounted() {
    console.log("mountd");
  },
  methods: {
    nextUnit(e) {
      this.$emit("nextUnit", e);
      this.next_key++;
    },

    nextRound() {
      // round_pitstop = false
      this.$emit("nextRound");
      // emit
    },

    isCorrect() {
      this.$emit("correct");
    },

    isIncorrect(e) {
      this.$emit("incorrect", e);
    },

    next() {
      this.$emit("pastWord", this.word);
      this.$emit("next");
      this.next_key++;
    },

    test() {
      console.log("test");
      this.$emit("pastWord", this.word);
    },
  },
});
</script>
