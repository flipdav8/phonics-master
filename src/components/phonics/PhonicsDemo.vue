<template>
  <q-page
    class="fit column items-center justify-center non-selectable phonics-page bg-blsue-1 grid-container"
  >
    <!-- <div class="fit" id="plane"></div> -->
    <!-- <div v-if="student !== null" class="q-mb-xl text-h6">

    </div> -->

    <!-- <q-avatar size="100px">
      <img src="~assets/phonic-icons/snail-dots.svg" />
    </q-avatar> -->
    <!-- <BalloonIcon style="width: 10rem" class="show_border"></BalloonIcon> -->
    <!-- <q-icon style="font-size: 10rem">
      <img src="~assets/phonic-icons/balloon-dots.svg" type="image/svg+xml" />
    </q-icon> -->
    <!-- <q-icon name="mdi-airballoon-outline " style="font-size: 10rem"></q-icon> -->

    <!-- <q-btn no-caps @click="clearData">Clear</q-btn> -->

    <div class="fit absolute">
      <q-linear-progress
        stripe
        size="10px"
        :value="progress"
        style="width: 100%"
      />

      <q-linear-progress
        size="10px"
        :value="unit_score / possible_score"
        style="width: 100%"
        color="blue-8"
      />
    </div>
    <div v-show="mounted" class="flex flex-center fit hiddens z-top">
      <!-- UNITS -->
      <div
        v-show="word == null"
        class="flex row q-my-md q-gutter-sm absolute hidden"
        style="top: 0px"
      >
        <q-btn
          v-for="(unit, i) in units"
          :key="i"
          no-caps
          :outline="select_unit !== null && select_unit.id === unit.id"
          @click="changeUnit(unit)"
          :disable="unit.disable"
        >
          {{ unit.label }}
          <q-icon v-if="unit.pass" name="mdi-check" color="green"></q-icon>
        </q-btn>
        <!-- {{ select_unit }} -->

        <!-- <q-btn @click="revision_mode = !revision_mode" no-caps flat>
        {{ revision_mode ? "Revision" : "Normal" }}</q-btn
      > -->
      </div>

      <div class="hidden">rounds:{{ rounds }} {{ student_data }}</div>

      <div v-if="select_unit != null" class="fit text-center">
        <div v-if="unit_passed || word == null">
          <NextUnit
            v-if="!revision_mode"
            :units="units"
            :current_unit="select_unit"
            @nextUnit="nextUnit"
          ></NextUnit>
          <div v-else>Passed unit</div>
        </div>
        <PhonicsWord
          ref="word"
          v-if="word !== null"
          class="fit"
          :word="word"
          :key="word.id + '-' + next_key"
          :blocks="phonic_options"
          :mode="mode"
          :look_at_data="look_at_data[select_unit.id]"
          :target="select_unit.target"
          @next="next()"
          @isCorrect="isCorrect"
          @isIncorrect="isIncorrect"
        ></PhonicsWord>
      </div>
    </div>

    <div class="invisible">
      <q-btn no-caps flat style="font-size: 40px">
        <q-icon name="mdi-arrow-right-circle" class="bg-white"></q-icon>
      </q-btn>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import PhonicsWord from "./PhonicsWord.vue";
import NextUnit from "./NextUnit.vue";
import PhonicWordSound from "./words/PhonicWordSound.vue";
import PhonicWordSpelling from "./words/PhonicWordSpelling.vue";
import PhonicHelp from "./words/PhonicHelp.vue";
import { api } from "src/boot/axios";

import Courses from "src/services/courses";

export default defineComponent({
  name: "phonics-example",
  components: {
    PhonicsWord,
    NextUnit,
    // PhonicWordSound,
    // PhonicWordSpelling,
    // PhonicHelp,
  },
  data() {
    return {
      mounted: false,
      next_key: 0,
      phonic_options: [
        {
          id: 0,
          label: "æ",
          value: "ae",
          type: "sound", // or spelling
          icon: "mdi-snail",
          options: [
            { label: "ay", icon: "", sound: null },
            { label: "a-e", icon: "", sound: null },
            { label: "ai", icon: "", sound: null },
            { label: "a", icon: "", sound: null },
            { label: "ea", icon: "", sound: null },
          ], // TODO: shuffle order..
        },
        {
          id: 1,
          label: "ow",
          value: "ow",
          type: "spelling",
          options: [
            { label: "bee", icon: "mdi-bee", sound: null },
            { label: "snail", icon: "mdi-snail", sound: null },
          ],
        },
      ], // no in blocks table
      select_unit: null,
      units: [
        {
          id: 0,
          label: "Unit 1",
          details: [],
          target: 1,
          // phonic_option_id: 0, // ay, etc..
          words: [
            {
              id: "bare",
              word: "bare",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "sound",
              pattern: [
                {
                  letters: "b",
                  input: false,
                  icon: { src: "/phonic-icons/snail-dots.svg" },
                  // icon: "mdi-snail",
                  sound: null,
                  block: null,
                  correct: "",
                  exlude: [],
                },
                {
                  letters: "a-e",
                  input: true,
                  icon: { src: "/phonic-icons/snail-dots.svg" },
                  sound: null,
                  block: 0,
                  exclude: [],
                  correct: "a-e",
                  exlude: [],
                },
                {
                  letters: "r",
                  input: false,
                  icon: { src: "/phonic-icons/snail-dots.svg" },
                  // icon: "mdi-snail",
                  sound: null,
                  block: null,
                  correct: "",
                  exlude: [],
                },
              ],
              homo: {
                id: "bare",
                label: "bare",
                src: "mdi-foot-print",
              },
            },

            {
              id: 0,
              word: "aid",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "sound",
              pattern: [
                {
                  letters: "ai",
                  input: true,
                  icon: { src: "/phonic-icons/snail-dots.svg" },
                  // icon: "mdi-snail",
                  sound: null,
                  block: 0,
                  correct: "ai",
                },
                {
                  letters: "d",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
              ],
              homo: null,
            },
            // {
            //   id: 1,
            //   word: "day",
            //   // icon: "mdi-snail",
            //   // variations: [""],
            //   // phonic_option_id: 0,
            //   // correct: "ay",
            //   type: "sound",
            //   pattern: [
            //     {
            //       letters: "d",
            //       input: false,
            //       icon: "mdi-dog-side",
            //       sound: null,
            //       block: null, exclude: [],
            //       correct: "",
            //     },
            //     {
            //       letters: "ay",
            //       input: true,
            //       icon: "mdi-airplane",
            //       sound: null,
            //       block: 0,
            //       correct: "ay",
            //     },
            //   ],
            //   homo: null,
            // },
            // {
            //   id: 2,
            //   word: "break",
            //   // icon: "mdi-snail",
            //   // phonic_option_id: 0, // ay, etc..
            //   // correct: "ai",
            //   type: "spelling",
            //   pattern: [
            //     {
            //       letters: "br",
            //       input: false,
            //       icon: "mdi-snail",
            //       sound: null,
            //       block: 0,
            //       correct: "",
            //     },
            //     {
            //       letters: "ea",
            //       input: true,
            //       icon: "mdi-snail",
            //       sound: null,
            //       block: 1,
            //       correct: "snail", // label
            //     },
            //     {
            //       letters: "k",
            //       input: false,
            //       icon: "mdi-dog-side",
            //       sound: null,
            //       block: null, exclude: [],
            //       correct: "",
            //     },
            //   ],
            //   homo: null,
            // },
          ],
        },
        {
          id: 1,
          label: "Unit 2",
          details: [],
          target: 3,
          // phonic_option_id: 0, // ay, etc..
          words: [
            // {
            //   id: 0,
            //   word: "aid",
            //   // icon: "mdi-snail",
            //   // phonic_option_id: 0, // ay, etc..
            //   // correct: "ai",
            //   type: "sound",
            //   pattern: [
            //     {
            //       letters: "ai",
            //       input: true,
            //       icon: "mdi-snail",
            //       sound: null,
            //       block: 0,
            //       correct: "ai",
            //     },
            //     {
            //       letters: "d",
            //       input: false,
            //       icon: "mdi-dog-side",
            //       sound: null,
            //       block: null, exclude: [],
            //       correct: "",
            //     },
            //   ],
            //   homo: null,
            // },
            {
              id: 1,
              word: "day",
              // icon: "mdi-snail",
              // variations: [""],
              // phonic_option_id: 0,
              // correct: "ay",
              type: "sound",
              pattern: [
                {
                  letters: "d",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "ay",
                  input: true,
                  icon: "mdi-airplane",
                  sound: null,
                  block: 0,
                  correct: "ay",
                },
              ],
              homo: null,
            },
            {
              id: 2,
              word: "break",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "spelling",
              pattern: [
                {
                  letters: "br",
                  input: false,
                  icon: "mdi-snail",
                  sound: null,
                  block: 0,
                  correct: "",
                },
                {
                  letters: "ea",
                  input: true,
                  icon: "mdi-snail",
                  sound: null,
                  block: 1,
                  correct: "snail", // label
                },
                {
                  letters: "k",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
              ],
              homo: null,
            },
          ],
        },
      ],
      revision_mode: false,
      unit_passed: false,
      rounds: 0,
      //student.. bob... unit_id:
      //hop... then if really good... hopping, hopped, etc..
      mode: "testing", // or help
      start_help: false,

      word_index: 0,
      word: null,
      selected_input: null,
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
    };
  },
  mounted() {
    this.mountedMethod();
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
      Courses.setup();
      if (this.$route.query.course_id != undefined) {
        this.course_id = this.$route.query.course_id;
      }
      // this.view_as = localStorage.getItem("view_as");
      // if (this.view_as != undefined) {
      //   console.log("view as", this.view_as);
      //   this.view_as = JSON.parse(this.view_as);
      //   this.local = this.view_as.type === "local" ? true : false;
      //   await this.setupStudent(this.view_as.id);
      // }

      await this.setupCourse();

      this.mountedUnit();
      this.checkUnits();
      // console.log("student", this.student);

      this.mounted = true;
    },

    async setupCourse() {
      // console.log("this.router", this.$route);

      if (this.$route.query.course_id != undefined) {
        //TODO: save course to db.. sync all blocks for everyone
        let blocks = (await Courses.getBlocks()).map((e) => ({
          ...e.block,
          ...{ id: e.id },
        }));
        this.phonic_options = blocks;

        let course_units = await Courses.getCourseUnits(
          this.$route.query.course_id
        );

        this.units = course_units.map((e) => ({
          ...e.unit,
          ...{ id: e.id },
        }));

        console.log("course units", this.units);
      } else {
        return;
        // let course = await Courses.getCourse();
        let blocks = (await Courses.getBlocks()).map((e) => ({
          ...e.block,
          ...{ id: e.id },
        }));
        this.phonic_options = blocks;
        // console.log("this.phonic_options", this.phonic_options);
        let units = (await Courses.getUnits()).map((e) => ({
          ...e.unit,
          ...{ id: e.id },
        }));
        this.units = units;
        // console.log("blocks", blocks);
        // console.log("units", units);
      }
    },

    selectInput(v) {
      this.selected_input = v;
      this.correct = null;
    },

    async setupStudent(id) {
      try {
        // this.student = await syncdb.students.get(id);

        this.student = await Courses.getStudent(id, this.local, this.view_as);
        const progress = await Courses.getProgress(
          this.student,
          this.course_id,
          this.local
        );
        this.student_data = progress.data;
        this.progress_id = progress.id;
        // console.log("this.student_data", this.student_data);
      } catch (error) {
        let status = `Failed to read student: ${error}`;
        console.log("status error", status);
        this.student = null;
      }
    },

    next() {
      this.correct = null;
      this.selected_input = null;
      this.word_index++;
      let words = this.select_unit.words;
      // let data = this.example_data;
      let data = this.revision_mode ? this.revision_data : this.student_data;

      if (this.word_index > words.length - 1) {
        this.checkUnitPass();
        if (this.mode === "testing") {
          this.mode = "helping";
          this.start_help = true;
        } else {
          this.mode = "testing";
        }

        this.word_index = 0;
        this.rounds++;
        if (data[this.select_unit.id]["rounds"] === undefined) {
          data[this.select_unit.id]["rounds"] = 1;
        } else {
          data[this.select_unit.id].rounds++;
        }
      }

      let next_word = words[this.word_index];

      if (data[this.select_unit.id] !== undefined) {
        if (data[this.select_unit.id].unit_pass) {
          // console.log("unit passed");
          // this.unit_passed = true;
          // this.word = null;
          // return;
        }

        let pick_words = [];
        if (this.mode === "testing") {
          //pick words not mastered
          // let target = this.revision_mode ? this.revision_target : this.target; // maybe 1 if in revision
          let target = this.select_unit.target;
          pick_words = this.select_unit.words.filter(
            // (e) => !data[this.select_unit.id].pass.includes(e.id)
            (e) =>
              data[this.select_unit.id].track[e.id] == undefined ||
              data[this.select_unit.id].track[e.id] < target
          );
        } else if (this.mode === "helping") {
          // pick tricky words
          pick_words = this.select_unit.words.filter(
            (e) => data[this.select_unit.id].track[e.id] < 0
          );
        }

        if (pick_words.length === 0) {
          // no words need helping or testing...

          if (this.mode === "helping") {
            this.mode = "testing";
            this.word_index = -1;
            this.next();
            return;
          } else {
            // data[this.select_unit.id].unit_pass = true;
            // this.unit_passed = true;
            this.word = null;
            this.checkUnitPass();
            return;
          }
        }
        let pick_word_ids = pick_words.map((e) => e.id);
        if (!pick_word_ids.includes(next_word.id)) {
          // console.log("need to chang eword");
          this.next();
          return;
        }
      }

      data[this.select_unit.id].word_index = this.word_index;
      data[this.select_unit.id].mode = this.mode;
      this.word = next_word;

      // console.log("next word ", this.word);
      this.next_key++;
      this.saveData(data);
    },

    checkUnitPass() {
      //
      // console.log("check unit pass");
      // let data = this.example_data;
      let data = this.revision_mode ? this.revision_data : this.student_data;
      if (data[this.select_unit.id] !== undefined) {
        const word_ids = this.select_unit.words.map((e) => e.id);
        const pass_ids = data[this.select_unit.id].pass;
        let check = 0;
        // let target = this.revision_mode ? this.revision_target : this.target;
        let target = this.select_unit.target;

        let word_progress_count = 0;
        for (let idx = 0; idx < word_ids.length; idx++) {
          const id = word_ids[idx];
          // if (pass_ids.includes(id)) {
          if (data[this.select_unit.id].track[id] >= target) {
            check++;
            word_progress_count++;
          } else {
            break;
          }
        }
        this.unit_progress = word_progress_count / word_ids.length;

        // IF REVISION MODE..
        if (check === word_ids.length) {
          if (!data[this.select_unit.id].unit_pass) {
            this.unit_passed = true;
            data[this.select_unit.id].unit_pass = true;
            data["complete_id"] = this.select_unit.id;
            let next_index =
              this.units.findIndex((e) => e.id === this.select_unit.id) + 1;
            let next_unit = this.units[next_index];
            if (next_unit !== undefined) {
              data["current_unit_id"] = next_unit.id;
            } else {
              data["all_completed"] = true;
            }
          } else {
            if (data[this.select_unit.id].revised == undefined) {
              data[this.select_unit.id].revised = 1;
            } else {
              data[this.select_unit.id].revised++;
            }
          }
          this.checkUnits();
          this.saveData(data);
        }
      }
    },
    checkUnits() {
      let start_index = 0;
      // if (this.student_data.current_unit_id !== undefined) {
      //   start_index = this.units.findIndex(
      //     (e) => e.id === this.student_data.current_unit_id
      //   );
      // }
      let data = this.revision_mode ? this.revision_data : this.student_data;
      // console.log("data", data);
      let passed_count = 0;
      for (let idx = start_index; idx < this.units.length; idx++) {
        const unit = this.units[idx];

        if (data[unit.id] !== undefined) {
          if (data[unit.id].unit_pass) {
            unit.pass = true;
            passed_count++;
          } else {
            unit.pass = false;
          }
        } else {
          unit.pass = false;
          if (
            data.current_unit_id !== undefined &&
            data.current_unit_id === unit.id
          ) {
            unit.disable = false;
          } else {
            unit.disable = true;
          }
        }
      }

      this.progress = passed_count / this.units.length;
    },

    isCorrect() {
      let unit_id = this.select_unit.id;
      // let data = this.example_data;
      let data = this.revision_mode ? this.revision_data : this.student_data;

      if (data[unit_id] === undefined) {
        this.setupUnitData(data);
      }

      // let track_key= this.revision_mode ? 'revision_track' : 'track'

      let log_data = {
        correct: true,
      };
      if (data[unit_id].track[this.word.id] === undefined) {
        data[unit_id].track[this.word.id] = 1;
        data[unit_id].log[this.word.id] = [log_data];
      } else {
        data[unit_id].log[this.word.id].push(log_data);
        if (data[unit_id].track[this.word.id] < 0) {
          data[unit_id].track[this.word.id] = 1;
        } else {
          data[unit_id].track[this.word.id]++;
        }
      }

      // let target = this.revision_mode ? this.revision_target : this.target; // maybe 1 if in revision
      let target = this.select_unit.target;

      if (data[unit_id].track[this.word.id] >= target) {
        // don't show again..
        if (!data[unit_id].pass.includes(this.word.id)) {
          data[unit_id].pass.push(this.word.id);
        }
      }

      this.unit_score++;
      // this.saveData(data);
    },
    isIncorrect(final_word) {
      let unit_id = this.select_unit.id;
      // let data = this.example_data;
      let data = this.revision_mode ? this.revision_data : this.student_data;
      if (data[unit_id] === undefined) {
        this.setupUnitData(data);
      }
      let log_data = {
        correct: false,
        input: final_word,
      };
      if (data[unit_id].track[this.word.id] === undefined) {
        data[unit_id].track[this.word.id] = -1;
        data[unit_id].log[this.word.id] = [log_data];
      } else {
        data[unit_id].log[this.word.id].push(log_data);
        if (data[unit_id].track[this.word.id] > 0) {
          data[unit_id].track[this.word.id] = -1;
        } else {
          data[unit_id].track[this.word.id]--;
        }

        if (data[unit_id].pass.includes(this.word.id)) {
          //
        }
      }
      // this.saveData(data);
    },

    mountedUnit() {
      // let data = this.example_data;
      let data = this.revision_mode ? this.revision_data : this.student_data;
      let unit = this.units[0];
      if (data["current_unit_id"] !== undefined) {
        unit = this.units.find((e) => e.id === data.current_unit_id);
        if (unit === undefined) {
          unit = this.units[0];
        }
      }
      this.select_unit = unit;
      if (data[unit.id] === undefined) {
        this.setupUnitData(data);
      }

      this.changeUnit(unit);
    },
    nextUnit(unit) {
      this.unit_passed = false;
      this.next_key++;
      // console.log("unit", unit);
      this.changeUnit(unit);
    },
    changeUnit(unit) {
      this.select_unit = unit;

      // this.mode = "helping";
      // this.start_help = true;

      this.word_index = 0;
      if (this.student_data[unit.id] !== undefined) {
        this.word_index = this.student_data[unit.id].word_index;
        if (this.student_data[unit.id].mode !== undefined) {
          this.mode = this.student_data[unit.id].mode;
          this.start_help = true;
        }
        if (this.student_data[unit.id].unit_pass) {
          this.unit_passed = true;
          // this.word = null;
          if (this.revision_data[unit.id] === undefined) {
            this.setupUnitData(this.revision_data);
            this.revision_mode = true;
          } else {
            console.log("here");
            return;
          }
        } else {
          this.revision_mode = false;
          this.unit_passed = false;
        }
      } else {
        this.setupUnitData(this.student_data);
      }

      this.word = this.select_unit.words[this.word_index];
      // if (this.example_data[this.word.id] != undefined) {
      //   this.example_data[this.word.id].track = {};
      // }
      this.checkUnitProgress();
    },
    setupUnitData(data) {
      let unit_id = this.select_unit.id;
      data[unit_id] = {
        track: {}, //word.id key
        log: {},
        pass: [],
        unit_pass: false,
        rounds: 0,
        word_index: 0,
      };
      data["current_unit_id"] = this.select_unit.id;
    },
    checkUnitProgress() {
      let data = this.revision_mode ? this.revision_data : this.student_data;
      let target = this.select_unit.target;
      let total_words = this.select_unit.words.length;
      let full_score = total_words * target;

      let track = data[this.select_unit.id].track;

      this.possible_score = full_score;
      // console.log("possiblescore", total_words, target);
      console.log("possiblescore", this.possible_score);

      let current_score = 0;
      for (const property in track) {
        // console.log(`${property}: ${object[property]}`);
        let value = track[property];
        if (value > 0) {
          current_score++;
        }
      }
      this.unit_score = current_score;
    },

    async saveData(data) {
      if (this.student === null) {
        return;
      }
      return;

      console.log("data to save", data);
      await Courses.saveProgress(
        this.student,
        this.course_id,
        data,
        this.progress_id,
        this.local
      );
    },
    async clearData() {
      await Courses.clearProgress(this.student);
    },
  },
});
</script>
<!-- transform: perspective(300px) rotateX(20deg) scale(2, 1) translateZ(0) -->
<!-- rotateZ(40deg) translateX(-20px) translateY(200px); -->
<style>
.phonics-page {
  background-image: linear-gradient(0deg, #e3f2fd, rgba(0, 0, 200, 0.3));
}

.grid-container {
  position: relative;
  overflow: hidden;
  z-index: 0;
}

.grid-container:after {
  -webkit-mask-image: -webkit-gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
  mask-image: gradient(
    linear,
    left 90%,
    left top,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
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
  /* -webkit-background-clip: content-box;
  -webkit-backface-visibility: hidden; */
  outline: 1px solid transparent;
  transform-origin: bottom center;
  will-change: transform;
}

.grid-container:after {
  background-position: center bottom;
  background-size: 5% 5%;
  background-image: linear-gradient(to right, #5db3ff8e 90%, transparent 2px),
    linear-gradient(to bottom, #5db3ff8e 100%, transparent 2px);
}
</style>
