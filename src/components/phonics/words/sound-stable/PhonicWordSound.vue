<template>
  <div
    class="outer-container column flex items-center justify-center non-selectable"
  >
    <!-- Main button -->
    <!-- full-width changes if buttons autoshrinks -->
    <!-- <div class="absolute" style="bottom: 0px">
      <q-btn @click="makeProgress()">Make Progress</q-btn>
      <q-btn @click="toggleSqueeze()">Toggle Squeeze</q-btn>
    </div> -->

    <!-- <div class="test">wwww</div> -->
    <div>
      <div
        :class="{
          'full-width': full_width,
          tada: word_pass,
          animated: word_pass,
        }"
        class="flex justify-center my-animation-speed"
        style="position: relative"
      >
        <div class="phonics-primary-btn-progress"></div>
        <div class="phonics-primary-btn" no-caps @click="changeLetters()">
          <div
            class="phonics-primary-btn--inner animated fadeIn my-animation-speed"
          >
            <div v-if="outer_fixed" class="phonics-letters text-grey invisible">
              <span v-for="(pattern, i) in input_pattern" :key="i">
                <span
                  v-if="pattern.input"
                  :style="{
                    display: 'inline-block',
                    width: `${findLongestOption(pattern) - 0}em`,
                  }"
                ></span>
                <span v-else>{{ pattern.letters }}</span>
              </span>
            </div>

            <div class="phonics-loop-outer" :class="{ absolute: outer_fixed }">
              <div
                v-for="(pattern, i) in input_pattern"
                :key="i"
                class="phonics-loop"
              >
                <div
                  v-if="pattern.input"
                  class="phonics-primary-input phonics-letters"
                  :class="animatedClass"
                >
                  <span class="phonics-slot">
                    <div class="text-center" style="display: inline-block">
                      <div class="phonics-squeeze" :key="squeeze_key">
                        <span v-if="allow_squeeze" id="current_letters">
                          <WordLetters
                            mode="hidden"
                            :pattern="pattern"
                            :correct="correct"
                            :split_end="split_end"
                            :squeeze="allow_squeeze"
                          >
                          </WordLetters>
                        </span>
                        <span v-else>
                          <!-- need to find longest letter input -->
                          <span
                            :style="{
                              display: 'inline-block',
                              width: `${findLongestOption(pattern) - 0}em`,
                            }"
                          ></span>
                          <!-- <span
                        v-for="ch in findLongestOption(pattern)"
                        :key="ch"
                      >
                        d
                      </span> -->
                        </span>
                      </div>
                    </div>
                  </span>

                  <span
                    class="absolute animated fit"
                    :class="test_class[0]"
                    style="left: 0px; margin: auto; right: 0px"
                    :style="{
                      animationDuration:
                        pattern.selected == null ? '0s' : `${speed}s`,
                    }"
                    :key="pattern.flip_key"
                  >
                    <WordLetters
                      mode="current"
                      class="fit"
                      :pattern="pattern"
                      :correct="correct"
                      :split_end="split_end"
                      :squeeze="allow_squeeze"
                    >
                    </WordLetters>
                  </span>

                  <span
                    class="absolute animated fit"
                    :class="test_class[1]"
                    style="left: 0px; margin: auto; right: 0px"
                    :style="{ animationDuration: `${speed}s` }"
                    :key="'d' + pattern.flip_key"
                  >
                    <WordLetters
                      mode="past"
                      :pattern="pattern"
                      :correct="correct"
                      :split_end="split_end"
                      :squeeze="allow_squeeze"
                    >
                    </WordLetters>
                  </span>
                </div>

                <div v-else class="phonics-letters">
                  {{ pattern.letters }}
                </div>

                <div
                  v-if="
                    (i > 0 &&
                      input_pattern[i - 1].input &&
                      input_pattern[i - 1].split_options &&
                      allow_squeeze) ||
                    (pattern.input &&
                      pattern.split_options &&
                      pattern.last &&
                      allow_squeeze)
                  "
                  class="phonics-letters phonics-primary-input text-grey"
                >
                  <span
                    v-if="
                      pattern.input && pattern.split_options && pattern.last
                    "
                  >
                    <AutogrowLetters
                      v-if="
                        (pattern.selected != null &&
                          pattern.selected.includes('-')) ||
                        (pattern.old_letters !== null &&
                          pattern.old_letters.includes('-'))
                      "
                      :key="i + '-' + pattern.old_letters"
                      :letters="
                        pattern.selected.includes('-')
                          ? pattern.selected.split('-')[1]
                          : pattern.old_letters.split('-')[1]
                      "
                      class="invisibles"
                      :speed="squeeze_speed"
                      :grow="pattern.selected.includes('-') ? true : false"
                    ></AutogrowLetters>
                  </span>
                  <AutogrowLetters
                    v-else-if="
                      (input_pattern[i - 1].selected != null &&
                        input_pattern[i - 1].selected.includes('-')) ||
                      (input_pattern[i - 1].old_letters !== null &&
                        input_pattern[i - 1].old_letters.includes('-'))
                    "
                    :key="i + '-' + input_pattern[i - 1].old_letters"
                    :letters="
                      input_pattern[i - 1].selected.includes('-')
                        ? input_pattern[i - 1].selected.split('-')[1]
                        : input_pattern[i - 1].old_letters.split('-')[1]
                    "
                    class="invisibles"
                    :speed="squeeze_speed"
                    :grow="
                      input_pattern[i - 1].selected.includes('-') ? true : false
                    "
                  ></AutogrowLetters>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="absolute"
          style="bottom: 0px; right: 0px; left: 0px; margin: auto"
        >
          <slot name="homo"></slot>
        </div>
      </div>
    </div>

    <!-- <br /> -->
    <!-- <br /> -->

    <!-- <div class="absolute-full show_border"></div> -->
    <!-- <GoButton @go="checkWord"></GoButton> -->
  </div>
</template>

<script>
import WordLetters from "./WordLetters.vue";
import AutogrowLetters from "./AutogrowLetters.vue";
// import GoButton from "../GoButton.vue";

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

export default {
  props: {
    word: { required: true },
    blocks: { required: true },
    word_progress: {},
    target: {},
  },

  components: {
    WordLetters,
    AutogrowLetters,
    // GoButton,
  },
  setup() {
    return {
      // infoStore,
    };
  },
  data() {
    return {
      mounted: false,
      squeeze_key: 0,
      from_width: null,
      to_width: null,
      allow_squeeze: true,
      speed: 1,
      squeeze_speed: "0.5s",
      test_classes: [
        ["slideInDown", "slideOutDown"],
        ["zoomIn", "zoomOut"],
        ["fadeIn", "fadeOut"],
        ["bounceInDown", "bounceOutDown"],
        ["fadeInDown", "fadeOutDown"],
        ["flipInX", "flipOutX"],
        ["rollIn", "rollOut"],
        ["zoomInDown", "zoomOutDown"],
      ],
      test_class: ["slideInDown", "slideOutDown"],
      //
      progress_step: 33,
      progress_target: 0,
      raw_progress: 0,
      progress: "0%",
      progress_color: "rgba(135,215,233, 1)",
      //
      interval: null,

      input_pattern: [],
      correct: null,
      next_key: 0,

      split_end: "",

      main_width: "100%", //useful if changed to 90% and full widths is true
      full_width: false,
      outer_fixed: true, // only makes sense if full_width is false,
      //
      allow_press: true,
      //
      word_pass: false,
    };
  },
  created() {
    //
  },

  mounted() {
    // console.log("mounted");
    this.mountedMethod();
    this.mounted = true;
    if (this.word_progress !== undefined && this.target !== undefined) {
      this.progress_step = 100 / this.target;
      this.progress_target = this.word_progress * 100;
      this.raw_progress = this.word_progress * 100;
      this.progress = this.word_progress * 100 + "%";
      // this.makeProgress();
    }
  },
  beforeUnmount() {
    //
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
    mountedMethod() {
      let pattern = [];

      for (let idx = 0; idx < this.word.pattern.length; idx++) {
        const element = this.word.pattern[idx];
        const exclude = element.exclude;
        let options = [];
        if (element.input && element.block != null) {
          let block_id =
            element.block.id !== undefined ? element.block.id : element.block;
          let block = this.blocks.find((e) => e.id === block_id);
          if (block != undefined) {
            // options = shuffle(block.options);
            options = shuffle(
              block.options.filter((e) => !exclude.includes(e.label))
            );
            // options = block.options;
          }
        }

        let split_options = false;
        for (let index = 0; index < options.length; index++) {
          if (idx === this.word.pattern.length - 1) {
            // break; //bad idea
          }

          const label = options[index].label;
          if (label.includes("-")) {
            split_options = true;
            this.split_end = label.split("-")[1];
            // there shouldn't be more than 1 split spelling for a word.
          }
        }
        // console.log("split_options", split_options);

        let ps = this.word.pattern[idx + 1];
        let next = "-";
        if (ps != undefined) next = ps.letters;

        pattern.push({
          ...element,
          ...{
            selected: null,
            options: options,
            flip_key: 0,
            split_options: split_options,
            past: null,
            next: next,
            old_letters: null,
            last: idx === this.word.pattern.length - 1,
          },
        });

        // console.log("pattern", pattern);
      }
      this.input_pattern = pattern;

      if (!this.allow_squeeze) return;
      this.$nextTick(function () {
        const width = document.getElementById("current_letters").offsetWidth;
        this.from_width = width + "px";
        this.to_width = width + "px";
      });
    },

    changeLetters() {
      if (!this.allow_press) return;
      let pattern = this.input_pattern.find((e) => e.input);
      if (pattern == undefined) return;

      // this.changed = true;/
      // this.$emit("changed");
      // console.log("change pattern");

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

      let patterns = this.input_pattern.filter((e) => e.input);
      for (let idx = 0; idx < patterns.length; idx++) {
        const element = patterns[idx];
        element.old_letters = element.selected;
        element.selected = next_option.label;

        element.flip_key++;
      }

      // pattern.old_letters = pattern.selected;
      // pattern.selected = next_option.label;

      // pattern.flip_key++;

      if (this.allow_squeeze) {
        this.makeSqueeze();
      }

      this.allow_press = false;
      let vm = this;
      setTimeout(function () {
        vm.allow_press = true;
      }, 500);
    },

    makeSqueeze() {
      this.$nextTick(function () {
        const width = document.getElementById("current_letters").offsetWidth;
        if (this.to_width !== null) {
          this.from_width = this.to_width;
        }
        this.to_width = width + "px";
        this.squeeze_key++;
      });
    },

    toggleSqueeze() {
      this.allow_squeeze = !this.allow_squeeze;
      if (this.allow_squeeze) {
        this.makeSqueeze();
      }
    },

    makeProgress() {
      let vm = this;
      this.progress_target = this.progress_target + this.progress_step;
      if (this.progress_target > 100) {
        this.word_pass = true;
        this.progress_target = 0;
        this.raw_progress = 0;
        this.progress = "0%";

        return;
      }
      this.interval = setInterval(function () {
        vm.raw_progress++;
        vm.progress = vm.raw_progress + "%";
        if (vm.raw_progress > vm.progress_target) {
          clearInterval(vm.interval);
        }
      }, 20);
    },

    reverseProgress() {
      let vm = this;
      this.progress_target = 0;

      this.interval = setInterval(function () {
        vm.raw_progress--;
        vm.progress = vm.raw_progress + "%";
        if (vm.raw_progress <= vm.progress_target) {
          clearInterval(vm.interval);
        }
      }, 20);
    },

    checkWord() {
      let selected_word = this.makeWordFromPattern();
      let correct_word = this.word.word;

      console.log("selected_word", selected_word);
      console.log("correct_word", correct_word);
      let vm = this;
      if (selected_word === correct_word) {
        this.correct = true;
        this.$emit("isCorrect", selected_word);
        this.makeProgress();

        window.setTimeout(function () {
          vm.next();
        }, 3000);
      } else {
        this.correct = false;
        this.$emit("isIncorrect", selected_word);
        this.reverseProgress();

        window.setTimeout(function () {
          vm.makeWordCorrect();
          vm.correct = "corrected";
          window.setTimeout(function () {
            vm.next();
          }, 3000);
        }, 2000);
      }
    },

    //FIXME: doesn't work with a-ch-e for example but have code that should work in services/mapping
    makeWordFromPattern() {
      let map = this.input_pattern.map((e) =>
        e.input ? e.selected : e.letters === "-" ? "_" : e.letters
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

      let ww = w;
      //exists because of words like yo-yo
      if (w.includes("_")) {
        ww = w.replaceAll("_", "-");
      }

      return ww;
    },

    makeWordCorrect() {
      for (let idx = 0; idx < this.input_pattern.length; idx++) {
        const element = this.input_pattern[idx];
        if (element.input) {
          element.selected = this.word.pattern[idx].letters;
          element.flip_key++;
        }
      }
      if (this.allow_squeeze) {
        this.makeSqueeze();
      }
    },

    next() {
      this.next_key++;
      this.$emit("next");
    },

    findLongestOption(pattern) {
      const longest = (key, array) =>
        Math.max(
          ...array.map((it) =>
            it[key].includes("-") ? it[key].length - 1 : it[key].length
          )
        );
      const long = longest("label", /*in*/ pattern.options);
      // console.log("long", long);
      return long;
      // return pattern.letters;
    },
  },
};
</script>
<style>
.outer-container {
  container-type: inline-size;
  container-name: main-area;
}

@container main-area (min-width: 0px) {
  .phonics-letters {
    font-size: 12cqmin !important;
  }

  .test {
    position: absolute;
    z-index: 1000;
    background: pink;
    font-size: 12cqmax !important;
  }
}
</style>
<style>
.phonics-letters {
  font-size: 100%;
}

.my-animation-speed {
  animation-duration: 3s;
}

.my-animation-speed-fast {
  animation-duration: 2s;
}

.my-animation-speed-slow {
  animation-duration: 5s;
}
</style>

<style>
.bg-view-2 {
  background-image: linear-gradient(
    135deg,
    #2064a3 0%,
    #cc716e 50%,
    #98408a 100%
  );
}

.phonics-primary-color {
  color: #69cde4;
}

.phonics-primary-btn {
  background: #231f20;
  color: white;
  border-radius: 20vw;
  border-collapse: separate;
  border-spacing: 0;
  letter-spacing: 0.5rem;
  background-clip: content-box;
  border: solid 1.5vw rgba(255, 255, 255, 0.2);
  cursor: pointer;
  position: relative;
  width: v-bind(main_width);
  display: flex;

  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.phonics-primary-btn-progress {
  display: block;
  border-radius: 20vw;
  width: v-bind(main_width);
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
  position: absolute;
  margin: auto;

  background-color: transparent;
  background: linear-gradient(
    to right,
    v-bind(progress_color) v-bind(progress),
    transparent v-bind(progress)
  );
}

.phonics-icon-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.phonics-loop-outer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.phonics-loop {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phonics-primary-btn--inner {
  margin: 2vh 0px;
  padding: 0px 8vw;
  padding-bottom: 1vw;
  font-size: 10vw;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid 0px purple;
  position: relative;
}

.stamp {
  mask-image: url("grunge.png");
  -webkit-mask-image: url("grunge.png");
}
/* mask-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png"); */

.phonics-secondary-btn:hover,
.phonics-primary-btn:hover {
  background-color: rgba(35, 31, 32, 0.95);
  background-color: #161515;
  color: rgba(255, 255, 255, 1);
}

.phonics-primary-input {
  color: #69cde4;
  display: inline-block;
  position: relative;
  overflow: visible;
}

.phonics-slot {
  color: transparent;
}

.phonics-slot-bordered {
  color: transparent;
  border: dashed 1px white;
  border-left: dashed 1px white;
}

.phonics-secondary-btn {
  background: #231f20;
  border-radius: 20vw;
  border-collapse: separate;
  border-spacing: 0;
  background-clip: content-box;
  border: solid 1vw rgba(255, 255, 255, 0.2);
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: center;
  overflow: hidden;
}
.phonics-secondary-btn--inner {
  margin: 1vw 2vw;
  padding-bottom: 1vw;
  font-size: 5vw;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  /* mask-image: url("grunge.png");
  -webkit-mask-image: url("grunge.png");*/
}

/*  animation: squeeze 0.5s linear forwards;   border: solid 0px purple;*/
.phonics-squeeze {
  display: inline-block;
  border-radius: 2vw;
  background: transparent;
  border-left: dotted 0px rgba(255, 255, 255, 0.1);
  border: dotted 0px rgba(255, 255, 255, 0.1);
  animation-name: squeeze;
  animation-duration: v-bind(squeeze_speed);
  animation-timing-function: ease-in-out;
  animation-direction: forwards;
  animation-fill-mode: backwards;
}

@keyframes squeeze {
  from {
    width: v-bind(from_width);
  }
  to {
    width: v-bind(to_width);
  }
}
</style>
<!-- /* Small Screen Width  */
@media only screen and (min-width: 200px) and (max-width: 640px) {
  .phonics-primary-btn--inner {
    margin: 30px 15px;
    padding: 0px;
    font-size: 30px;
    overflow: hidden;
  }

  .phonics-secondary-btn div:first-child {
    padding: 0px 10px;
    margin: 10px 20px;
    font-size: 25px;
  }
} -->
