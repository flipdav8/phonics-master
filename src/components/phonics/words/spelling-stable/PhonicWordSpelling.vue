<template>
  <div class="fit non-selectable">
    <div class="fit flex row items-center justify-center">
      <div class="con">
        <!--  -->
        <div class="full-widths flex justify-center" style="position: relative">
          <div class="phonics-primary-btn-progress"></div>
          <div class="phonics-primary-btn" no-caps>
            <div class="phonics-primary-btn--inner">
              <div
                v-for="(pattern, i) in input_pattern"
                :key="i"
                class="phonics-loop"
              >
                <div class="phonics-letters">
                  <span v-if="pattern.input" class="phonics-primary-color">
                    {{ pattern.letters }}</span
                  ><span v-else> {{ pattern.letters }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex row fit justify-center items-center phonics-word normal-word hidden"
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

        <div style="position: relative">
          <div
            v-for="(l, idx) in input_pattern.filter((e) => e.input)"
            :key="idx"
          >
            <div class="flex flex-center justify-center items-center">
              <div
                v-for="(s, i) in l.options"
                :key="i"
                clickable
                @click="changeInput(l, s.label)"
                :outline="l.option_label === s.label"
                class="cursor-pointer phonics-normal-text"
              >
                <div v-if="s.icon === null" class="q-mx-md">
                  <div
                    v-if="l.combo"
                    class="phonic-input-combo flex row"
                    :class="animatedClass(l.option_label, s.label, l)"
                  >
                    <div v-for="(ss, ii) in s.label.split('+')" :key="ii">
                      <component
                        :is="ss + 'Icon'"
                        :label="false"
                        :dots="false"
                        :center="true"
                        :scale="true"
                        :class="iconClass(l.option_label, s.label)"
                        class="phonic-input-general flex row"
                      >
                      </component>
                    </div>
                  </div>
                  <div v-else>
                    {{ s.label }}
                  </div>
                </div>
                <div
                  v-else-if="s.icon.icon_name !== undefined"
                  :class="animatedClass(l.option_label, s.label, l)"
                >
                  <!-- <q-icon
                  name="mdi-snail"
                  class="phonic-input-general"
                  :class="iconClass(l.option_label, s.label)"
                ></q-icon> -->

                  <component
                    :is="s.icon.icon_name"
                    :label="false"
                    :dots="false"
                    :center="true"
                    :scale="true"
                    class="phonic-input-general"
                    :class="iconClass(l.option_label, s.label)"
                  >
                  </component>
                </div>
                <div
                  v-else-if="s.icon.src === undefined"
                  :class="animatedClass(l.option_label, s.label, l)"
                >
                  <span v-if="s.icon.length < 1">{{ s.label }}</span>
                  <q-icon
                    v-else
                    :name="s.icon"
                    class="phonic-input-general"
                    :class="iconClass(l.option_label, s.label)"
                  ></q-icon>
                </div>
                <div v-else :class="animatedClass(l.option_label, s.label, l)">
                  <q-icon :class="iconClass(l.option_label, s.label)">
                    <img :src="s.icon.src" type="image/svg+xml" />
                  </q-icon>
                </div>
              </div>
            </div>
          </div>
          <div
            class="absolute"
            style="bottom: 0px; right: 0px; left: 0px; margin: auto"
          >
            <slot name="homo"> hello homophone </slot>
          </div>
        </div>
      </div>
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

    let input_count = 0;

    for (let idx = 0; idx < this.word.pattern.length; idx++) {
      const element = this.word.pattern[idx];
      // const exclude = element.exclude; //
      let options = [];
      if (element.input && element.block != null) {
        input_count++;
        let block_id =
          element.block.id !== undefined ? element.block.id : element.block;
        let block = this.blocks.find((e) => e.id === block_id);
        if (block != undefined) {
          options = shuffle(block.options);
          // options = shuffle(
          //   block.options.filter((e) => !exclude.includes(e.label))
          // );
        }
      }

      pattern.push({ ...element, ...{ selected: null, options: options } });
    }

    let final_pattern = pattern;
    if (input_count > 1) {
      let keep = [];
      let count = 0;
      for (let index = 0; index < pattern.length; index++) {
        const element = pattern[index];
        if (element.input && element.block != null) {
          let in_group = keep.find((e) => e.block.id === element.block.id);
          if (in_group != undefined && count == index) {
            in_group.letters = in_group.letters + element.letters;
            in_group.combo = true;
            count++;
          } else {
            keep.push(element);
            count++;
          }
        } else {
          keep.push(element);
          count++;
        }
      }

      final_pattern = keep;
    }

    this.input_pattern = final_pattern;
  },

  computed: {},
  methods: {
    checkWord() {
      let selected_word = this.makeWordFromPattern();
      let correct_word = this.word.word;
      let vm = this;

      console.log("selected_word", selected_word);
      console.log("correct_word", correct_word);

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
          vm.next();
        }, 4000);

        return;
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
    iconClass(option_label, label) {
      let classes = [];
      if (option_label == label) {
        classes.push("phonic-selected floating-no-margin");
      } else {
        //
      }

      return classes;
    },

    animatedClass(option_label, label, pattern_section) {
      let correct_label = pattern_section.options.find(
        (e) => e.label === pattern_section.correct
      ).label;

      if (this.correct === true) {
        if (label === correct_label) {
          return "animated my-animation-speed-fast bounce correct-border text-green";
        } else {
          return "";
        }
      } else if (this.correct === false) {
        if (label === correct_label) {
          return " animated my-animation-speed shakeY  corrected-border";
        } else {
          return " animated my-animation-speed incorrect-border text-red";
        }
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
          // element.selected = this.word.pattern[idx].letters;

          element["option_label"] = element.options.find(
            (e) => e.label === element.correct
          ).label;
          console.log("element.", element);
        }
      }
    },

    next() {
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
@import url("https://fonts.googleapis.com/css?family=Bowlby+One+SC");

.correct-border {
  border-radius: 15%;
}

.corrected-border {
  border: dashed 4px green;
  border-radius: 15%;
}

.incorrect-border {
  border-radius: 15%;
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
