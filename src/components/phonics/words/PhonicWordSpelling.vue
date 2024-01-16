<template>
  <div class="fit non-selectable">
    <div class="fit flex row items-center justify-center">
      <div class="fit">
        <div
          class="flex row word-test fit justify-center items-center normal-word"
        >
          <div v-for="(l, i) in input_pattern" :key="i">
            <div v-if="!l.input" class="text-grey-8">
              {{ l.letters }}
            </div>
            <div v-else>
              <strong class="text-black"> {{ l.letters }}</strong>
            </div>
          </div>
        </div>

        <div
          v-for="(l, idx) in input_pattern.filter((e) => e.input)"
          :key="idx"
        >
          <div class="flex row justify-center q-gutter-x-xl items-center">
            <!-- <strong> {{ l.letters }}</strong> -->
            <q-chip
              v-for="(s, i) in l.options"
              :key="i"
              clickable
              @click="changeInput(l, s.label)"
              :outline="l.option_label === s.label"
              class="text-h4"
              :class="animatedClass"
            >
              <div v-if="s.icon.src === undefined">
                <span v-if="s.icon.length < 1">{{ s.label }}</span>
                <q-icon v-else :name="s.icon" size="xl"></q-icon>
              </div>
              <div v-else>
                <q-icon>
                  <img :src="s.icon.src" type="image/svg+xml" />
                </q-icon>
              </div>
            </q-chip>
          </div>
        </div>
      </div>
    </div>

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
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";
// import PhonicOptions from "./PhonicOptions.vue";

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
    // PhonicOptions
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
      pattern.push({ ...element, ...{ selected: null, options: options } });
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

      // console.log("selected_word", selected_word);
      // console.log("correct_word", correct_word);

      let selected_inputs = this.input_pattern
        .filter((e) => e.input)
        .map((e) => e.selected);
      if (selected_word === correct_word) {
        this.correct = true;
        this.$emit("isCorrect", selected_word);
        window.setTimeout(function () {
          vm.next();
        }, 3000);
      } else {
        this.correct = false;
        this.$emit("isIncorrect", selected_inputs);
        window.setTimeout(function () {
          vm.makeWordCorrect();
          vm.correct = "corrected";
          window.setTimeout(function () {
            vm.next();
          }, 3000);
          // vm.checkWord();
          // vm.next();
        }, 2000);
      }
    },

    makeWordFromPattern() {
      let map = this.input_pattern.map((e) =>
        e.input ? e.selected : e.letters
      );
      let w = map.join("");

      //not going to be an issue with spelling words..
      //TODO:might need to rearrange though in render
      // if (w.includes("-")) {
      //   let str = w;
      //   let split = str.split("");
      //   function rearrangeArray(arr) {
      //     let result = [];
      //     for (let i = 0; i < arr.length; i++) {
      //       if (arr[i] === "-" && i + 1 < arr.length) {
      //         result.push(arr[i + 2]);
      //         result.push(arr[i + 1]);
      //       } else if (i === 0 || (arr[i - 2] !== "-" && arr[i - 1] !== "-")) {
      //         result.push(arr[i]);
      //       }
      //     }
      //     return result;
      //   }

      //   let arr = split;
      //   let re = rearrangeArray(arr);
      //   w = re.join("");
      // }

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
      this.correct = null;
      this.next_key++;
      this.$emit("next");
    },

    playSound() {
      var audio = new Audio("path/to/allow_sound.mp3"); // replace 'path/to/allow_sound.mp3' with the actual path to your sound file
      // Play the sound
      audio.play();
    },

    changeInput(pattern, option_label) {
      this.changed = true;
      this.$emit("changed");
      pattern["option_label"] = option_label;
      if (pattern.correct === option_label) {
        pattern.selected = pattern.letters;
      } else {
        pattern.selected = null;
      }
      // pattern.selected =
      //  if(pattern.corr)
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
