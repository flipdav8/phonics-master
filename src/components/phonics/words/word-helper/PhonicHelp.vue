<template>
  <div class="column flex-center non-selectable">
    <!-- <div class="flex row text-h1 items-center">{{ word.word }}</div> -->
    <div class="flex column container">
      <!-- <q-btn flat no-caps @click="test()">test</q-btn> -->
      <!-- phonics-word long-word -->
      <div
        class="flex row justify-center items-center text-h2"
        style="
          height: 100px;
          border: solid 0px;
          border-radius: 10px;
          letter-spacing: 0.5rem;
        "
        :class="animatedClass"
      >
        <span v-if="splitSpellingCorrect" class="absolute">
          {{ word.word }}
        </span>

        <span
          :class="{
            invisible: splitSpellingCorrect,
          }"
          v-for="(item, i) in input"
          :key="i"
          class="hiddens"
        >
          <span v-if="item.name.includes('^')">
            <q-icon name="mdi-ghost-outline" color="grey" size="xl"></q-icon>
            <span> {{ item.name.split("^")[1] }}</span>
          </span>
          <span v-else>
            {{ item.name }}
          </span>
        </span>

        <span class="hiddens">
          <span
            v-for="(l, i) in map_pattern.length - inputLetters - skipped"
            :key="i"
          >
            <span>•</span>
          </span>
        </span>
      </div>

      <br />
      <div class="flex row justify-center text-h3">
        <q-card
          v-for="item in grid"
          :key="item.id"
          class="text-center q-pa-sm q-ma-sm phonics-help-card"
          style="cursor: pointer"
          :class="letterClass(item)"
          @click="selectLetters(item)"
        >
          <span v-if="item.name.includes('^')">
            <!-- {{ item.name.split("^")[1] }} -->
            <q-icon name="mdi-"></q-icon>
          </span>
          <span v-else> {{ item.name }}</span>
        </q-card>
      </div>
    </div>

    <div
      class="flex row q-pa-md justify-center q-gutter-x-md"
      style="position: relative"
    >
      <div v-for="(pattern, i) in icon_pattern" :key="i">
        <div
          v-if="pattern.icon != null"
          class="cursor-pointer phonic-input-icon"
          @click="pressIcon(pattern, i)"
        >
          <div v-if="pattern.icon.icon_name !== undefined">
            <component
              :is="pattern.icon.icon_name"
              :label="false"
              :dots="false"
              :center="true"
              :scale="true"
              :class="iconClass(pattern, i)"
              size="xl"
            >
            </component>
          </div>

          <div
            v-else-if="pattern.icon.src === undefined"
            :class="iconClass(pattern, i)"
          >
            <q-icon :name="pattern.icon" size="xl"></q-icon>
          </div>
          <!-- <div v-else :class="iconClass(pattern, i)">
            <q-icon style="font-size: 80px">
              <img :src="pattern.icon.src" type="image/svg+xml" />
            </q-icon>
          </div> -->

          <q-badge v-if="pattern.letters.includes('^')" floating>ghost</q-badge>
        </div>
        <div v-else></div>
        <div v-if="pattern.icon !== null" class="mt-md hiddens">
          <q-btn
            icon="mdi-volume-high"
            flat
            @click="playSound(pattern)"
          ></q-btn>
        </div>
      </div>

      <div
        class="absolute"
        style="bottom: 0px; right: 0px; left: 0px; margin: auto"
      >
        <slot name="homo"> </slot>
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
import { VueDraggable } from "vue-draggable-plus";

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
  name: "phonic-help",
  components: {},
  props: {
    word: { required: true },
  },
  data() {
    return {
      input: [],
      example: [
        {
          name: "t",
          id: 1,
          class: "col-3 drag",
        },

        {
          name: "",
          id: 222,
          class: "col-3 no-pointer-events",
        },
        {
          name: "ue",
          id: 3,
          class: "col-3 drag",
        },
        {
          name: "",
          id: 11,
          class: "col-3 no-pointer-events",
        },
        {
          name: "",
          id: 22,
          class: "col-3 no-pointer-events",
        },
        {
          name: "r",
          id: 2,
          class: "col-3 drag",
        },
      ],
      map_pattern: [],
      grid: [],
      correct: null,
      final_input: [],
      icon_pattern: [],
      highlight_icons: true,
      highlight_letters: false,
      press_index: 0,
      // pause_letters: true,
      pressed: false,
      skipped: 0,
    };
  },
  mounted() {
    // console.log("mounted");
    this.makeGrid();

    let pattern = [];
    for (let idx = 0; idx < this.word.pattern.length; idx++) {
      const element = this.word.pattern[idx];
      pattern.push(element);
    }
    this.icon_pattern = pattern;
  },
  computed: {
    splitSpellingCorrect() {
      if (
        this.word.pattern
          .map((e) => e.letters)
          .join("")
          .includes("-") &&
        this.correct
      ) {
        return true;
      }

      return false;
    },

    animatedClass() {
      if (this.correct === true) {
        return "animated my-animation-speed-fast bounce text-green";
      } else if (this.correct === false) {
        return "animated  my-animation-speed zoomOut text-red";
      } else if (this.correct === "corrected") {
        return "animated my-animation-speed zoomIn";
      } else {
        return "";
      }
    },

    inputLetters() {
      return this.input.length;
      let input = this.input;

      let input_letters = input
        .map((e) => (e.name === "-" ? "_" : e.name))
        .join("")
        .replace("-", "")
        .replace("^", "");

      if (input_letters.length > this.map_pattern.length) {
        return this.map_pattern.length;
      }
      // if (input_letters.length === this.map_pattern.length) {
      //   return this.map_pattern.length - 1;
      // }
      return input_letters.length;
    },
  },
  methods: {
    makeGrid() {
      let grid = [];

      let pattern = this.word.pattern;
      let map_pattern = [];
      let skip = false;
      for (let idx = 0; idx < pattern.length; idx++) {
        if (skip === idx) {
          skip = false;
          continue;
        }

        const element = pattern[idx];

        let name = element.letters;

        // for (let ii = idx + 1; ii < pattern.length; ii++) {
        //   const nxt = pattern[ii];
        //   if (nxt !== undefined) {
        //     if (nxt.input && nxt.block.id === element.block.id) {
        //       name = name + nxt.letters;
        //       skip = ii;
        //       this.skipped++;
        //     } else {
        //       break;
        //     }
        //   } else {
        //     break;
        //   }
        // }

        grid.push({
          name: name,
          id: idx,
          input: element.input,
          class: element.input
            ? "col-auto drag text-weight-bold"
            : "col-auto drag ",
        });

        // if (element.input && element.letters.includes("-")) {
        //   map_pattern.push(element.letters.replace("-", ""));
        // } else {
        //   map_pattern.push(element.letters);
        // }
      }
      //^exists because of words like one.. ^one
      // this.map_pattern = map_pattern.join("").replaceAll("^", "");

      this.map_pattern = this.word.pattern;

      shuffle(grid);
      this.grid = grid;
    },

    checkWord() {
      let w = this.input
        .map((e) => (e.name === "-" ? "_" : e.name))
        .join("")
        .split(" ")[0];

      let correct_word = this.word.word;
      let final_word = this.makeWordFromPattern(w);
      // let correct_word = this.makeWordFromPattern();
      console.log("final word", final_word);
      console.log("correcspelling", correct_word);

      let vm = this;
      if (final_word === correct_word) {
        this.correct = true;
        this.$emit("isCorrect", final_word);
        window.setTimeout(function () {
          vm.next();
        }, 3000);
      } else {
        this.correct = false;
        this.$emit("isIncorrect", final_word);
        window.setTimeout(function () {
          vm.setCorrect();
          vm.correct = "corrected";
          window.setTimeout(function () {
            vm.next();
          }, 3000);
        }, 3000);
      }

      // this.next();
    },
    makeWordFromPattern(word) {
      if (word !== undefined) {
        var w = word;
      } else {
        var map = this.word.pattern.map((e) =>
          e.letters === "-" ? "_" : e.letters
        );
        var w = map.join("");
      }

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
    setCorrect() {
      let grid_input = [];
      for (let idx = 0; idx < this.word.pattern.length; idx++) {
        const element = this.word.pattern[idx];
        grid_input.push({
          name: element.letters,
          id: idx,
          class: "col-3 drag",
        });
      }

      this.input = grid_input;
    },

    letterClass(item) {
      let classes = [item.class];
      if (!this.pressed) {
        // classes.push(" disabled no-pointer-events");
      }
      if (this.input.map((e) => e.name).includes(item.name)) {
        // classes.push(" disabled ");
      }

      // if (
      //   this.highlight_icons &&
      //   !this.input.map((e) => e.name).includes(item.name)
      // ) {
      //   classes.push("no-pointer-events");
      // }
      if (
        this.highlight_letters &&
        !this.input.map((e) => e.name).includes(item.name)
      ) {
        // classes.push(" pulseLetters");
      }
      return classes;
    },
    selectLetters(item) {
      let r = this.input.findIndex((e) => e.id === item.id);
      if (r > -1) {
        this.input.splice(r, 1);
        item.class = item.class.split("selected-letters");
      } else {
        this.input.push(item);
        item.class = item.class + " selected-letters";
      }
      this.highlight_letters = false;
      if (this.map_pattern.length - this.inputLetters > 0) {
        this.highlight_icons = true;
      } else {
        this.highlight_icons = false;
      }
      this.press_index = this.input.length;
    },

    pressIcon(pattern, index) {
      this.pressed = true;
      // pattern.pressed = true;
      // this.press_index = index + 1;
      // this.press_index = this.input.length + 1;
      //play sound

      if (this.map_pattern.length - this.inputLetters > 0) {
        this.highlight_letters = true;
        // this.highlight_icons = false;
      } else {
        this.highlight_icons = false;
        this.highlight_letters = false;
      }

      this.playSound(pattern);
    },
    iconClass(pattern, index) {
      // !pattern.pressed &&
      if (this.press_index === index) {
        if (this.highlight_icons) {
          return "pulseIcon";
        } else {
          return "";
        }
      } else {
        return "";
      }
    },

    next() {
      this.$emit("next");
    },

    playSound(pattern) {
      var audio = new Audio(`/phonic-sounds/${pattern.icon.sound_src}`);
      audio.play();
    },
    onUpdate() {
      console.log("update");
    },
    onAdd(e) {
      console.log("add", e.item.innerHTML);
      this.final_input.push({ name: e.item.innerHTML });
    },
    remove(e) {
      // console.log("remove", e);
      e.item.classList.add("disabled");
      e.item.classList.add("no-pointer-events");
    },
    onClone() {
      console.log("clone");
    },

    onEnd(e) {
      // console.log("onend", e);
    },

    test() {
      this.list = [
        {
          name: "ue",
          id: 3,
          class: "drag",
        },
      ];
    },
  },
});
</script>
<style>
.my-animation-speed-fast {
  animation-duration: 2s;
}

.my-animation-speed {
  animation-duration: 3s;
}

.my-animation-slow {
  animation-duration: 4s;
}

.wrong-slow {
  animation: leave 2s ease-in-out;
}
@keyframes leave {
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.sortable-drag {
  background: transparent;
}
.ghost {
  background: transparent;
}

.pulseLetters {
  animation: pad 2s ease-in-out alternate infinite;
}
@keyframes pad {
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.pulseIcon {
  animation: pulse 2s ease-in-out alternate infinite;
}

.selected-letters {
  border: solid 3px black;
}

@keyframes pulse {
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}
</style>
