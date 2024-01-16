<template>
  <div class="fit non-selectable">
    <div class="fit flex row items-center justify-center">
      <div
        class="flex row word-test fit justify-center items-center normal-word"
      >
        <div
          v-for="(l, i) in input_pattern"
          :key="i"
          :class="correct === null && l.input ? 'floating' : ''"
        >
          <div v-if="!l.input" class="text-grey-8">
            {{ l.letters }}
          </div>
          <div
            v-if="l.selected !== null"
            @click="changeInputPattern(l, i)"
            :class="correct === null && l.input ? 'phonic-button-test' : ''"
          >
            <div :class="animatedClass">
              <PhonicLetters
                v-if="l.key > 1"
                class="absolute"
                :ref="'letters-' + i"
                :key="'p' + l.key"
                :letters="l.past"
                :exit="true"
                :correct="correct"
              ></PhonicLetters>
              <PhonicLetters
                :ref="'letters-' + i"
                :key="l.key"
                :letters="l.selected"
                :correct="correct"
              ></PhonicLetters>
            </div>
          </div>
          <div
            v-else-if="l.selected == null && l.input"
            class="phonic-button-test non-selectable"
            @click="changeInputPattern(l)"
          >
            <q-icon v-if="l.icon.src === undefined" :name="l.icon"></q-icon>
            <q-icon v-else>
              <img :src="l.icon.src" type="image/svg+xml" />
            </q-icon>
          </div>

          <div
            v-if="
              i > 0 &&
              input_pattern[i - 1].selected != undefined &&
              input_pattern[i - 1].selected.includes('-') &&
              (correct || correct === 'corrected')
            "
            class="col-grow cursor-pointer"
          >
            <div :class="animatedClass">
              {{ input_pattern[i - 1].selected.split("-")[1] }}
            </div>
          </div>
        </div>

        <!-- <q-icon
            v-show="correct === true"
            class="q-ml-sm"
            name="mdi-check-outline"
            color="green"
          ></q-icon>
          <q-icon
            v-show="correct === false"
            class="q-ml-sm"
            name="mdi-close"
            color="red"
          ></q-icon> -->
      </div>
    </div>

    <!-- :disable="selected_input == null" -->
    <div class="fit text-right q-pr-md hidden">
      <q-btn
        no-caps
        class="q-mt-xl bg-blue-5"
        size="xl"
        @click="checkWord()"
        :disable="!changed"
      >
        <q-icon name="mdi-thumb-up-outline"></q-icon>
      </q-btn>
    </div>

    <!-- <q-btn no-caps class="q-mt-xl" @click="next()">Next</q-btn> -->
    <!-- <div v-if="correct">yay..</div> -->
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";
// import PhonicOptions from "./PhonicOptions.vue";
import PhonicLetters from "./PhonicLetters.vue";

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export default defineComponent({
  name: "phonic-word",
  components: {
    // PhonicOptions,
    PhonicLetters,
  },
  props: {
    word: { required: true },
    blocks: { required: true },
  },
  data() {
    return {
      never_show_words: [], // correct three times...
      problem_words: [],
      //
      correct: null,
      next_key: 0,
      show_menu: false,
      shuffled_options: [],

      input_pattern: [],
      changed: false,
    };
  },
  mounted() {
    // console.log("mounted");
    let pattern = [];
    for (let idx = 0; idx < this.word.pattern.length; idx++) {
      const element = this.word.pattern[idx];
      let options = [];
      if (element.input && element.block != null) {
        let block_id =
          element.block.id !== undefined ? element.block.id : element.block;
        let block = this.blocks.find((e) => e.id === block_id);
        if (block != undefined) {
          options = shuffle(block.options);
        }
      }
      pattern.push({
        ...element,
        ...{ selected: null, options: options, key: 0, past: null },
      });
    }
    this.input_pattern = pattern;
  },

  computed: {
    animatedClass() {
      if (this.correct === true) {
        return "animated my-animation-speed-fast bounce text-green";
      } else if (this.correct === false) {
        return "animated zoomOut my-animation-speed text-red";
      } else if (this.correct === "corrected") {
        return "animated my-animation-speed zoomIn";
      } else {
        return "";
      }
    },
  },
  methods: {
    checkWord() {
      let selected_word = this.makeWordFromPattern();
      let correct_word = this.word.word;
      let vm = this;
      if (selected_word === correct_word) {
        this.correct = true;
        this.$emit("isCorrect", selected_word);
        window.setTimeout(function () {
          vm.next();
        }, 3000);
      } else {
        this.correct = false;
        this.$emit("isIncorrect", selected_word);
        window.setTimeout(function () {
          vm.makeWordCorrect();
          vm.correct = "corrected";
          window.setTimeout(function () {
            vm.next();
          }, 3000);
        }, 2000);
      }
    },

    makeWordFromPattern() {
      let map = this.input_pattern.map((e) =>
        e.input ? e.selected : e.letters
      );

      let w = map.join("");

      if (w.includes("-")) {
        // let str = "ba-er";
        // let str = "ga-ez";
        // let str = "ama-ezd";
        // let str = "volu-em";
        let str = w;
        let split = str.split("");
        function rearrangeArray(arr) {
          let result = [];
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] === "-" && i + 1 < arr.length) {
              result.push(arr[i + 2]);
              result.push(arr[i + 1]);
            } else if (i === 0 || (arr[i - 2] !== "-" && arr[i - 1] !== "-")) {
              result.push(arr[i]);
            }
          }
          return result;
        }

        let arr = split;
        let re = rearrangeArray(arr);
        w = re.join("");
      }

      return w;
    },

    makeWordCorrect() {
      for (let idx = 0; idx < this.input_pattern.length; idx++) {
        const element = this.input_pattern[idx];
        if (element.input) {
          element.selected = this.word.pattern[idx].letters;
        }
      }
    },

    next() {
      // this.correct = null;
      this.next_key++;
      this.$emit("next");
    },

    playSound() {
      var audio = new Audio("path/to/allow_sound.mp3"); // replace 'path/to/allow_sound.mp3' with the actual path to your sound file
      // Play the sound
      audio.play();
    },

    changeInputPattern(pattern, pattern_index) {
      this.changed = true;
      this.$emit("changed");
      // console.log("change pattern", this.word);
      console.log("change pattern");
      let options = pattern.options;
      let index = -1;
      if (pattern.selected != null) {
        index = options.findIndex((e) => e.label === pattern.selected);
      }
      index++;

      let next_option = options[index];
      if (next_option === undefined) {
        next_option = options[0];
      }

      // console.log("next option", next_option);
      pattern.past = pattern.selected;
      pattern.selected = next_option.label;

      pattern.key++;
      // if (this.$refs[`letters-${pattern_index}`] !== undefined) {
      //   this.$refs[`letters-${pattern_index}`].mounted = false;
      //   window.setTimeout(function () {
      //     pattern.key++;
      //   }, 1000);
      // }
    },
  },
});
</script>
<style>
.phonic-button {
  border: solid 1px;
  border-radius: 10px;
  box-shadow: inset 0 0 10px #72bcf7;
  padding: 10px;
  margin: 10px;
  width: 150px;
}

.my-animation-speed-fast {
  animation-duration: 2s;
}

.my-animation-speed {
  animation-duration: 3s;
}
.phonic-word div {
  display: inline-block;
}

@import url("https://fonts.googleapis.com/css?family=Bowlby+One+SC");

text {
  font-family: "Bowlby One SC", cursive;
}
svg {
  width: 100%;
}
h1 {
  text-align: center;
  font-family: "Bowlby One SC", cursive;
  font-size: 25.5vw;
}
</style>
