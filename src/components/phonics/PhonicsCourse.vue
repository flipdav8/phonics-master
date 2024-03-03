<template>
  <!-- phonics-page  grid-container -->
  <div
    class="fit flex column items-center justify-center non-selectable overflow-hidden bg-view-2"
  >
    <div class="absolute z-max hidden" style="top: 0px" v-if="dev_mode">
      DEV:
      <q-btn no-caps flat @click="forceNext()">Force Next</q-btn>
      <q-btn no-caps flat @click="switchModes"> Toggle: {{ mode }} </q-btn>
      <div v-if="select_unit != null" class="hidden">
        <div>words left to pass unit: {{ pick_words.length }}</div>
        <div>
          words left in round: {{ select_unit.words.length - 1 - word_index }}
        </div>
      </div>
      <!-- <div v-if="past_word != null">
        {{ past_word.id }}
      </div> -->
    </div>

    <div v-show="mounted" class="fit hiddens">
      <div class="hidden">rounds:{{ rounds }} {{ student_data }}</div>
      <PhonicParts
        v-if="select_unit != null"
        class="fit"
        ref="parts"
        :select_unit="select_unit"
        :unit_passed="unit_passed"
        :word="word"
        :revision_mode="revision_mode"
        :units="units"
        :look_at_data="look_at_data"
        :round_pitstop="round_pitstop"
        :quick_mode="quick_mode"
        :rounds="rounds"
        :phonic_options="phonic_options"
        :target="determineTarget(word)"
        :mode="mode"
        :next_unit_ready="next_unit_ready"
        @nextUnit="nextUnit"
        @nextUnitInformation="nextUnitInfo"
        @nextRound="round_pitstop = false"
        @correct="isCorrect"
        @incorrect="isIncorrect"
        @next="next"
        @overview="$emit('overview')"
        @pastWord="(e) => (past_word = e)"
      >
      </PhonicParts>

      <!-- <div
        v-if="past_word != null"
        class="animated fit"
        :class="'fadeOut'"
        :style="{ animationDuration: `${2}s` }"
        :key="next_key"
      >
        <PhonicParts
          v-if="select_unit != null"
          class="fit"
          ref="parts"
          :select_unit="select_unit"
          :unit_passed="unit_passed"
          :word="past_word"
          :revision_mode="revision_mode"
          :units="units"
          :look_at_data="look_at_data"
          :round_pitstop="round_pitstop"
          :quick_mode="quick_mode"
          :rounds="rounds"
          :phonic_options="phonic_options"
          :target="target"
          :mode="mode"
          :past="true"
          @nextUnit="nextUnit"
          @nextRound="round_pitstop = false"
          @correct="isCorrect"
          @incorrect="isIncorrect"
          @next="next"
          @overview="$emit('overview')"
        >
        </PhonicParts>
      </div>

      <div
        class="absolute-full animated fit flex flex-center"
        :class="'slideInRight'"
        :style="{ animationDuration: `${2}s` }"
        :key="'past' + next_key"
      >
        <PhonicParts
          v-if="select_unit != null"
          class="fit"
          ref="parts"
          :select_unit="select_unit"
          :unit_passed="unit_passed"
          :word="word"
          :revision_mode="revision_mode"
          :units="units"
          :look_at_data="look_at_data"
          :round_pitstop="round_pitstop"
          :quick_mode="quick_mode"
          :rounds="rounds"
          :phonic_options="phonic_options"
          :target="target"
          :mode="mode"
          @nextUnit="nextUnit"
          @nextRound="round_pitstop = false"
          @correct="isCorrect"
          @incorrect="isIncorrect"
          @next="next"
          @overview="$emit('overview')"
          @pastWord="(e) => (past_word = e)"
        >
        </PhonicParts>
      </div> -->
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import PhonicParts from "./PhonicCourseParts.vue";

import Courses from "src/services/courses";

export default defineComponent({
  name: "phonics-example",
  components: {
    PhonicParts,
  },
  props: {
    select_course: { required: true },
    select_student: { required: true },
    remote: { default: false },
    revise_mode: { default: false },
    quick_mode: { default: false },
    next_unit_ready: { default: false },
    demo: { default: false },
    demo_blocks: {},
    demo_units: {},
  },
  data() {
    return {
      mounted: false,
      next_key: 0,
      phonic_options: [], // now in blocks table... graphemes
      select_unit: null,
      units: [],
      revision_mode: false,
      unit_passed: false,
      rounds: 0,
      round_pitstop: false,
      //student.. bob... unit_id:
      //hop... then if really good... hopping, hopped, etc..
      mode: "testing", // or help

      word_index: 0,
      word: null,
      //
      view_as: null,
      local: true,
      student: null,
      example_data: {},
      revision_data: {},
      student_data: {},
      //
      target: 2,
      revision_target: 1,
      course_id: "default",
      progress_id: null,
      color: "grey",

      progress: 0,
      unit_progress: 0,
      unit_score: 0,
      possible_score: 0,
      //
      pick_words: [],
      past_word: null,
      //
      dev_mode: false,
    };
  },
  mounted() {
    if (this.demo) {
      this.phonic_options = this.demo_blocks;
      this.units = this.demo_units;
    }

    if (this.revise_mode) {
      this.revision_mode = true;
    }
    Courses.setup(); // token

    if (this.select_course != null && this.select_student != null) {
      this.mountedMethod();
    } else {
      this.changeUnit(this.units[0]);
      this.mounted = true;
    }

    this.dev_mode = process.env.DEV_MODE;
  },
  computed: {
    look_at_data() {
      if (this.revision_mode) {
        return this.revision_data;
      } else {
        return this.student_data;
      }
    },
  },
  methods: {
    async mountedMethod() {
      if (this.remote === true) this.local = false;

      this.course_id = this.select_course.id;
      this.student = this.select_student;
      // await this.getProgressData();
      if (this.revision_mode) {
        this.revision_data = this.select_course.revision_data.data;
      } else {
        // this.student_data = this.select_course.student_progress.data;
        if (this.select_course.unit_progress != undefined) {
          this.student_data = this.select_course.unit_progress.data;
        }
      }

      // console.log("revision_data", this.revision_data);F
      // this.progress_id = this.select_course.student_progress.id;

      await this.setupCourse();

      this.mountedUnit();
      // console.log("student", this.student);

      this.mounted = true;
    },
    async setupCourse() {
      let blocks = (await Courses.getBlocks()).map((e) => ({
        ...e.block,
        ...{ id: e.id },
      }));
      this.phonic_options = blocks;

      // let course_units = await Courses.getCourseUnits(this.course_id);
      // this.units = course_units.map((e) => ({
      //   ...e.unit,
      //   ...{ id: e.id },
      // }));
      // console.log(this.select_course.course_units);
      this.units = this.select_course.course_units.map((e) =>
        this.mapUnitFormat(e)
      );
      // console.log("units setup", this.units);
    },
    mapUnitFormat(e) {
      return {
        ...e,
        ...e.unit,
        ...{ id: e.id },
      };
    }, //

    updateUnits() {
      this.units = this.select_course.course_units.map((e) =>
        this.mapUnitFormat(e)
      );
    },

    forceNext() {
      if (this.unit_passed || this.word == null) {
        // this.nextUnit(need a unit);
        return;
      }

      if (this.round_pitstop) {
        this.round_pitstop = false;
        return;
      }

      this.isCorrect();
      // this.next();
      this.$refs.parts.$refs.word.next();
    },

    next() {
      this.word_index++;
      let words = this.select_unit.words;
      let data = this.revision_mode ? this.revision_data : this.student_data;

      if (this.word_index > words.length - 1) {
        //first round of words done..
        this.checkUnitPass();
        //switch modes..
        this.switchModes();
        this.word_index = 0;
        // keep track of rounds to compleete unit
        this.trackUnitRounds(data);
      }

      let next_word = words[this.word_index];

      let unit_data = data[this.select_unit.id];
      if (unit_data !== undefined) {
        if (unit_data.unit_pass) {
          this.unit_passed = true;
          this.word = null;
          return;
        }

        this.pick_words = this.pickWords(unit_data);
        let pick_words = this.pick_words;

        if (pick_words.length === 0) {
          if (this.mode === "helping") {
            this.mode = "testing";
            this.word_index = -1;
            this.next();
            return;
          } else {
            this.word = null;
            this.checkUnitPass();
            return;
          }
        }
        let pick_word_ids = pick_words.map((e) => e.id);
        if (!pick_word_ids.includes(next_word.id)) {
          this.next();
          return;
        }
      }

      unit_data["word_index"] = this.word_index;
      unit_data["mode"] = this.mode;
      this.word = next_word;
      this.next_key++;
      this.saveData(data);
    },
    switchModes() {
      if (this.mode === "testing") {
        this.mode = "helping";
      } else {
        this.mode = "testing";
      }
    },
    trackUnitRounds(data) {
      this.rounds++;
      if (data[this.select_unit.id]["rounds"] === undefined) {
        data[this.select_unit.id]["rounds"] = 1;
      } else {
        data[this.select_unit.id].rounds++;
      }
      this.round_pitstop = true;
    },
    pickWords(unit_data) {
      let pick_words = [];
      if (this.mode === "testing") {
        //pick words not mastered
        // let target = this.determineTarget();
        pick_words = this.select_unit.words.filter(
          (e) =>
            unit_data.track[e.id] == undefined ||
            unit_data.track[e.id] < this.determineTarget(e)
        );
      } else if (this.mode === "helping") {
        // pick tricky words where last answer was incorrect
        pick_words = this.select_unit.words.filter(
          (e) => unit_data.track[e.id] < 0
        );
      }

      return pick_words;
    },

    checkUnitPass() {
      let data = this.revision_mode ? this.revision_data : this.student_data;
      if (data[this.select_unit.id] !== undefined) {
        // let target = this.determineTarget();

        let check = 0;
        let word_progress_count = 0;
        // const word_ids = this.select_unit.words.map((e) => e.id);
        const words = this.select_unit.words;
        for (let idx = 0; idx < words.length; idx++) {
          const id = words[idx].id;
          if (
            data[this.select_unit.id].track[id] >=
            this.determineTarget(words[idx])
          ) {
            check++;
            word_progress_count++;
          } else {
            // break;
          }
        }
        this.unit_progress = word_progress_count / words.length;

        if (check === words.length) {
          if (!data[this.select_unit.id].unit_pass) {
            this.unit_passed = true;
            this.$emit("unitPass");
            data[this.select_unit.id].unit_pass = true;
            // data["complete_id"] = this.select_unit.id;
            // let next_index =
            //   this.units.findIndex((e) => e.id === this.select_unit.id) + 1;
            // let next_unit = this.units[next_index];
            // if (next_unit !== undefined) {
            //   data["current_unit_id"] = next_unit.id;
            // } else {
            //   data["all_completed"] = true;
            // }
          }

          this.saveData(data);
        }
      }
    },

    changeProgress(correct, input) {
      let unit_id = this.select_unit.id;
      let data = this.revision_mode ? this.revision_data : this.student_data;
      if (data[unit_id] === undefined) this.setupUnitData(data);

      let log_data = {
        correct: correct,
      };
      if (input !== undefined) {
        log_data["input"] = input;
        log_data["mode"] = this.mode;
      }
      // so we can provide for incorrect answers

      // console.log(" data[unit_id]", data[unit_id]);
      this.handleTrack(data, unit_id, correct, log_data);
      this.handlePoints(data, correct);

      // let target = this.determineTarget();
      if (
        correct &&
        data[unit_id].track[this.word.id] >= this.determineTarget(this.word)
      ) {
        // don't show again..
        if (!data[unit_id].pass.includes(this.word.id)) {
          data[unit_id].pass.push(this.word.id);
        }
      }

      // this.saveData(data);
    },
    handleTrack(data, unit_id, correct, log_data) {
      let track = data[unit_id].track;
      let log = data[unit_id].log;

      if (track[this.word.id] === undefined) {
        track[this.word.id] = correct ? 1 : -1;
        log[this.word.id] = [log_data];
        // console.log("track", track[this.word.id]);
        // console.log("log", log[this.word.id]);
        if (correct) {
          this.emitProgress(correct);
        }
      } else {
        log[this.word.id].push(log_data);
        if (correct) {
          if (track[this.word.id] < 0) {
            track[this.word.id] = 1;
          } else {
            track[this.word.id]++;
          }
          this.emitProgress(correct);
        } else {
          if (track[this.word.id] > 0) {
            track[this.word.id] = -1;
            // this.emitProgress(
            //   correct,
            //   JSON.parse(JSON.stringify(track[this.word.id]))
            // );
          } else {
            track[this.word.id]--;
          }
          this.emitProgress(correct);
        }
      }
    },
    handlePoints(data, correct) {
      // points can fluctuate
      if (data["points"] === undefined) {
        data["points"] = correct ? 1 : -1;
      } else {
        if (correct) {
          data["points"]++;
        } else {
          data["points"]--;
        }
      }

      //stars only accumulate
      if (correct) {
        if (data["stars"] === undefined) {
          data["stars"] = 1;
        } else {
          data["stars"]++;
        }
      }

      if (data["consecutive"] === undefined) {
        data["consecutive"] = {
          correct: correct ? 1 : 0,
          incorrect: correct ? 0 : 1,
          best: correct ? 1 : 0,
          worst: correct ? 0 : 1,
        };
      } else {
        if (correct) {
          if (data["consecutive"].correct > 0) {
            data["consecutive"].correct++;
          } else {
            data["consecutive"].correct = 1;
          }
          data["consecutive"].incorrect = 0;
          if (data["consecutive"].correct > data["consecutive"].best) {
            data["consecutive"].best = data["consecutive"].correct;
          }
        } else {
          if (data["consecutive"].incorrect > 0) {
            data["consecutive"].incorrect++;
          } else {
            data["consecutive"].incorrect = 1;
          }
          data["consecutive"].correct = 0;
          if (data["consecutive"].incorrect > data["consecutive"].worst) {
            data["consecutive"].worst = data["consecutive"].incorrect;
          }
        }
      }
    },
    emitProgress(correct, remove) {
      let data = this.revision_mode ? this.revision_data : this.student_data;
      this.$emit("unitProgress", {
        unit: this.select_unit,
        correct: correct,
        remove: remove,
        data: data,
        word: this.word,
      });

      if (correct) {
        this.unit_score++;
      } else {
        this.unit_score = this.unit_score - remove;
      }
    },
    isCorrect() {
      this.changeProgress(true);
    },
    isIncorrect(final_word) {
      this.changeProgress(false, final_word);
    },

    mountedUnit() {
      let data = this.revision_mode ? this.revision_data : this.student_data;
      // let unit = this.units[0];
      // // check where to start, otherwise from beginning
      // if (data["current_unit_id"] !== undefined) {
      //   let begin_unit = this.units.find((e) => e.id === data.current_unit_id);
      //   if (begin_unit !== undefined) unit = begin_unit;
      // }
      // this.select_unit = unit;
      // let unit = this.units.find(
      //   (e) => e.id === this.select_course.select_unit_id
      // );
      let unit = this.units[this.select_course.select_unit_index];
      this.select_unit = unit;
      if (data[unit.id] === undefined) this.setupUnitData(data);

      this.changeUnit(unit);
    },
    setupUnitData(data) {
      data[this.select_unit.id] = {
        track: {}, //word.id key
        log: {},
        pass: [],
        unit_pass: false,
        rounds: 0,
        word_index: 0,
      };
      data["current_unit_id"] = this.select_unit.id;
    },
    changeUnit(unit) {
      this.select_unit = unit;
      this.mode = "testing"; // don't keep this uncommented..
      // this.mode = "helping";

      this.word_index = 0;
      let data = this.revision_mode ? this.revision_data : this.student_data;
      if (data[unit.id] !== undefined) {
        this.word_index = data[unit.id].word_index;
        if (data[unit.id].mode !== undefined) this.mode = data[unit.id].mode;
        if (data[unit.id].rounds !== undefined)
          this.rounds = data[unit.id].rounds;
        if (data[unit.id].unit_pass) {
          this.unit_passed = true;
        } else {
          this.unit_passed = false;
        }
      } else {
        this.setupUnitData(data);
      }

      this.pick_words = this.pickWords(data[unit.id]);
      this.word = this.select_unit.words[this.word_index];
    },

    nextUnit(unit_info) {
      // console.log("next unit", unit_info);
      let unit = this.units[unit_info.unit_index];
      // let unit = unit_info.unit;
      if (unit.placeholder) {
        // console.log("placeholder still!"); // shouldn't happen now..
        let next_unit = this.select_course.course_units[unit_info.unit_index];
        unit = this.mapUnitFormat(next_unit);
      }
      // console.log("next_unit", unit);
      // return;
      this.round_pitstop = false;
      this.unit_passed = false;
      this.next_key++;
      // console.log("unit", unit);
      this.$emit("nextUnit", unit);
      this.changeUnit(unit);
    },

    nextUnitInfo(e) {
      // let data = this.revision_mode ? this.revision_data : this.student_data;
      // data.current_unit_id = e.unit.id;
      // delete data[data.complete_id]; //badd ideeas ... no need
      // console.log(" reached next unit data", data);
      this.$emit("nextUnitInfo", e);
    }, // triggers when next unit is reached but before loading words from next unit..

    async saveData(data) {
      this.$emit("saveData", data); //
    },

    async clearData() {
      await Courses.clearProgress(this.student);
    },

    determineTarget(word) {
      if (word != undefined && word.target !== undefined) {
        return word.target;
      }
      // if word isn't undefined and has a target key use that..
      // let target = this.select_unit.target;
      let target = this.revision_mode
        ? this.revision_target
        : this.select_unit.target;

      return target;
    },
  },
});
</script>
<!-- transform: perspective(300px) rotateX(20deg) scale(2, 1) translateZ(0) -->
<!-- rotateZ(40deg) translateX(-20px) translateY(200px); -->
<!-- .phonics-page {
  background-image: linear-gradient(180deg, #e3f2fd, rgba(0, 0, 200, 0.3));
} -->

<style style="scss">
.phonics-page {
  background-image: linear-gradient(0deg, #e3f2fd, rgba(0, 0, 200, 0.2));
}

.grid-container {
  position: relative;
  overflow: hidden;
  z-index: 0;
}
/* perepcetive 300px or 15rem*/
.grid-container:after {
  transform: perspective(300px) rotateX(20deg) scale(2, 1) translateZ(0)
    rotateZ(0) translateX(0) translateY(0);
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  padding: 0px;
  background-clip: content-box;
  backface-visibility: hidden;
  -webkit-background-clip: content-box;
  -webkit-backface-visibility: hidden;
  outline: 1px solid transparent;
  transform-origin: bottom center;
  will-change: transform;
}

.grid-container22:after {
  background-color: rgba(0, 0, 200, 0.3);
  background: repeating-linear-gradient(
    150deg,
    rgba(0, 0, 200, 0.3),
    rgba(0, 0, 200, 1) 5%
  );
}

.grid-container:after {
  -webkit-mask-image: -webkit-gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 0.8)),
    to(rgba(0, 0, 0, 0))
  );
  mask-image: gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
  background: repeating-linear-gradient(
      150deg,
      white,
      white 5px,
      transparent 5px,
      transparent 3%
    ),
    repeating-linear-gradient(
      30deg,
      white,
      white 5px,
      transparent 5px,
      transparent 3%
    );
}

.grid-containerC:after {
  background: repeating-radial-gradient(
    circle at 50%,
    white,
    white 10px,
    #eee 10px,
    #eee 20px
  );
}

.grid-containerE:after {
  background: repeating-radial-gradient(
    ellipse at 50% 100%,
    white,
    white 10px,
    #eee 10px,
    #eee 20px
  );
}

.grid-container2:after {
  background-position: center bottom;
  background-size: 5% 5%;
  background-image: linear-gradient(to right, #5db3ff8e 90%, transparent 2px),
    linear-gradient(to bottom, #5db3ff8e 90%, transparent 2px);
  animation: planeMove 2s linear infinite;
}

@keyframes planeMove {
  from {
    background-position: 0px 0px, 0px 0px;
  }
  to {
    background-position: 0px 0px, 0px 100px;
  }
}
</style>
<!-- background-size: 81px 46px; -->
<!-- repeating-linear-gradient( 90deg, rgba(0, 0, 200, 0.1), rgba(0, 0, 200, 0.1)
5px, transparent 5px, transparent 40px ) -->
<!-- -webkit-mask-image: -webkit-gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 0.8)),
    to(rgba(0, 0, 0, 0))
  );
  mask-image: gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  ); -->
<!-- background-size: 81px 46px; -->
<!-- .grid-container:after {
  background-position: center bottom;
  background-size: 5% 5%;
  background-image: linear-gradient(to right, #5db3ff8e 90%, transparent 2px),
    linear-gradient(to bottom, #5db3ff8e 100%, transparent 2px);
} -->
