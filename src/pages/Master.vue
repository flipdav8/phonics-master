<template>
  <q-page class="flex column">
    <q-tabs v-model="tab" inline-label align="justify">
      <q-tab name="blocks" icon="mdi-alphabetical" label="Blocks" no-caps />
      <q-tab
        name="words"
        icon="mdi-file-word-box-outline"
        label="Words"
        no-caps
      />
      <q-tab name="units" icon="mdi-school" label="Units" no-caps />
      <q-tab
        name="courses"
        icon="mdi-book-education-outline"
        label="Courses"
        no-caps
      />
    </q-tabs>

    <!-- <q-avatar
      size="100px"
      :style="{ background: $q.dark.mode ? '#e8e8e8' : '#f5f5f3' }"
    >
      <img src="~assets/phonic-icons/bnet.svg" />
    </q-avatar> -->

    <!-- <q-icon class="text-dark" style="font-size: 20rem">
      <img src="~assets/phonic-icons/bnet.svg" />
    </q-icon> -->
    <!-- <q-btn @click="playSound" flat no-caps>Test Sound</q-btn> -->
    <!-- <div class="font-test text-h3">Font</div> -->

    <q-tab-panels v-model="tab" keep-alive>
      <q-tab-panel name="blocks">
        <Blocks
          :blocks="blocks"
          :block_rows="block_rows"
          @removeBlock="deleteBlock"
          :icons="ICONS"
          :sounds="SOUNDS"
          :phonemes="phonemes"
        ></Blocks>
      </q-tab-panel>
      <!-- @refresh="getBlocksAPI()" -->

      <q-tab-panel name="units">
        <Units
          :blocks="blocks"
          :unit_rows="unit_rows"
          :words="words"
          @removeUnit="deleteUnit"
          :icons="ICONS"
          :sounds="SOUNDS"
        ></Units>
      </q-tab-panel>
      <!-- @refresh="getUnitsAPI()" -->

      <q-tab-panel name="words">
        <Words
          :words="words"
          :blocks="blocks"
          :word_rows="word_rows"
          @removeWord="deleteWord"
          :icons="ICONS"
          :sounds="SOUNDS"
          :phonemes="phonemes"
        ></Words>
      </q-tab-panel>
      <!-- @refresh="getWordsAPI()" -->

      <q-tab-panel name="courses">
        <Courses
          :blocks="blocks"
          :units="units"
          :course_rows="course_rows"
          @removeCourse="deleteCourse"
        ></Courses>
        <!-- @refresh="getCoursesAPI()" -->
      </q-tab-panel>
    </q-tab-panels>

    <div class="q-mx-lg q-px-lg hidden">
      Todos/Qs/Notes:
      <li>
        Editing/deleting words won't propagate to units where the words exist...
        atm... bascially make sure word is correct before adding to a unit
      </li>
    </div>
    <div class="q-mx-lg q-px-lg hidden">
      Todos/Qs:
      <li>Add loading cues.. when adding/editing db (nice to have)</li>
      <li>
        Upload sounds to assets folder, and create list for ruben to chose
        sounds
      </li>
      <li>
        Upload icons to assets folder, and create list for ruben to chose icons
      </li>
      <li>
        Add/improve auth middleware +- other codebase/website for this section
      </li>

      <br />
      <!-- <li>Handle split spelling</li> -->
    </div>
  </q-page>
</template>

<script>
import { defineComponent, registerRuntimeCompiler } from "vue";
// import DexieLogin from "src/components/dexie/DexieLogin.vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import Units from "src/components/master/Units.vue";
import Words from "src/components/master/Words.vue";
import Blocks from "src/components/master/Blocks.vue";
import Courses from "src/components/master/Courses.vue";

import axios from "axios";

import ICONLIST from "src/components/master/Icons.js";
const ICONS = ICONLIST.list;

import SOUNDLIST from "src/components/master/sounds.js";
const SOUNDS = SOUNDLIST.list;

import PHONEMES from "src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

export default defineComponent({
  name: "MasterPage",
  components: {
    Blocks,
    Words,
    Units,
    Courses,
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
      ICONS,
      SOUNDS,
      phonemes,
    };
  },
  data() {
    return {
      tab: "units",

      //
      blocks: [],
      block_rows: [],
      words: [],
      word_rows: [],
      units: [],
      unit_rows: [],
      courses: [],
      course_rows: [],
    };
  },
  mounted() {
    let allowed = ["flipdav8@gmail.com", "rubdav@hotmail.com"];

    if (!allowed.includes(this.accounts.currentUser.userId)) {
      this.$router.push("/");
    }
    this.getBlocksAPI();
    this.getWordsAPI();
    this.getUnitsAPI();
    this.getCoursesAPI();
  },

  methods: {
    async playSound() {
      // const audioFile = await import("~/assets/phonic-sounds/test.mp3");
      // const audio = new Audio(audioFile.default);
      // audio.play();
      // return;
      // const audioFile = require("~/assets/phonic-sounds/test.mp3");
      // const audioFile = require("~/assets/phonic-sounds/test.mp3");
      // const audio = new Audio(audioFile);
      // const audio = new Audio("/phonic-sounds/test.mp3");
      const audio = new Audio("/src/assets/phonic-sounds/test.mp3");
      audio.play();
    },

    async getBlocksAPI() {
      await this.getBlocks();
      return;
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        .get(`${base_url}/public/blocks`, {
          headers: {},
        })
        .then(function (response) {
          // console.log("BLOCKS api", response);
          vm.blocks = response.data;
          vm.makeBlockRows();
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async getBlocks() {
      try {
        useObservable(
          from(
            liveQuery(async () => {
              this.blocks = await syncdb.blocks.toArray();
              // console.log("local blocks", this.blocks);
              this.makeBlockRows();
            })
          )
        );
      } catch (error) {
        let status = `Failed to read blocks: ${error}`;
        console.log("status error", status);
      }
    },

    makeBlockRows() {
      let blocks = this.blocks;
      // console.log("blocks", blocks);
      let block_rows = [];
      for (let idx = 0; idx < blocks.length; idx++) {
        const block = blocks[idx];
        block_rows.push({
          id: block.id,
          label: block.block.label,
          block: block.block,
          icon: block.block.icon != null ? block.block.icon.icon_name : ".",
          options: block.block.options.length,
          type: block.block.type,
        });
      }
      this.block_rows = block_rows;
    },
    async deleteBlock(id) {
      let r = this.block_rows.findIndex((e) => e.id === id);
      this.block_rows.splice(r, 1);
    },

    async getWordsAPI() {
      await this.getWords();
      return;
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        // .get(`${base_url}/public/public_test`, {
        .get(`${base_url}/public/words`, {
          headers: {
            // "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          // console.log("WORDS api", response);
          vm.words = response.data;
          vm.makeWordRows();
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async getWords() {
      try {
        useObservable(
          from(
            liveQuery(async () => {
              this.words = await syncdb.words.toArray();
              this.makeWordRows();
            })
          )
        );
      } catch (error) {
        let status = `Failed to read words: ${error}`;
        console.log("status error", status);
      }
    },
    makeWordRows() {
      let words = this.words;
      // console.log("words", words);
      let word_rows = [];
      for (let idx = 0; idx < words.length; idx++) {
        const element = words[idx];
        const word = element.word;
        word_rows.push({
          id: element.id,
          units_count: element.unit_ids.length,
          label: word.word,
          block: word.block == null ? null : word.block.label,
          type: word.type,
          word: word,
          homophones: word.homophones,
        });
      }
      this.word_rows = word_rows;
      // this.word_rows = word_rows.sort(function (a, b) {
      //   if (a.word < b.word) {
      //     return -1;
      //   }
      //   if (a.word > b.word) {
      //     return 1;
      //   }
      //   return 0;
      // });
    },
    async deleteWord(id) {
      let r = this.word_rows.findIndex((e) => e.id === id);
      this.word_rows.splice(r, 1);
    },

    async getUnitsAPI() {
      await this.getUnits();
      return;
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        // .get(`${base_url}/public/public_test`, {
        .get(`${base_url}/public/units`, {
          headers: {
            // "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          // console.log("UNITS api", response);
          vm.units = response.data;
          vm.makeUnitRows();
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async getUnits() {
      try {
        useObservable(
          from(
            liveQuery(async () => {
              this.units = await syncdb.units.toArray();
              this.makeUnitRows();
            })
          )
        );
      } catch (error) {
        let status = `Failed to read units: ${error}`;
        console.log("status error", status);
      }
    },
    makeUnitRows() {
      let units = this.units;
      // console.log("units", units);
      let unit_rows = [];
      for (let idx = 0; idx < units.length; idx++) {
        const unit = units[idx];
        unit_rows.push({
          id: unit.id,
          label: unit.unit.label,
          unit: unit.unit,
          word_count: unit.unit.words.length,
          words: unit.unit.words,
        });
      }
      this.unit_rows = unit_rows;
    },
    async deleteUnit(id) {
      let r = this.unit_rows.findIndex((e) => e.id === id);
      this.unit_rows.splice(r, 1);
    },

    async getCoursesAPI() {
      await this.getCourses();
      return;
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        // .get(`${base_url}/public/public_test`, {
        .get(`${base_url}/public/courses`, {
          headers: {
            // "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          vm.courses = response.data;
          vm.makeCourseRows();
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async getCourses() {
      try {
        useObservable(
          from(
            liveQuery(async () => {
              this.courses = await syncdb.courses.toArray();
              this.makeCourseRows();
            })
          )
        );
      } catch (error) {
        let status = `Failed to read courses: ${error}`;
        console.log("status error", status);
      }
    },
    makeCourseRows() {
      let courses = this.courses;
      // console.log("courses", courses);
      let course_rows = [];
      for (let idx = 0; idx < courses.length; idx++) {
        const course = courses[idx];
        course_rows.push({
          id: course.id,
          label: course.course.label,
          course: course.course,
          units: course.course.units.length,
        });
      }
      this.course_rows = course_rows;
    },
    async deleteCourse(id) {
      let r = this.course_rows.findIndex((e) => e.id === id);
      this.course_rows.splice(r, 1);
    },
  },
});
</script>
<!-- @import url(https://fonts.googleapis.com/css?family=Ubuntu); -->
<style>
@import url("https://fonts.googleapis.com/css2?family=Mulish:wght@200;500&display=swap");

.font-test {
  font-family: "Mulish", sans-serif;
}

.masters-page {
  background-image: linear-gradient(0deg, #e3f2fd, rgba(0, 0, 200, 0.3));
}
</style>
