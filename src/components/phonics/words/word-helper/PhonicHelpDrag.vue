<template>
  <div class="column flex-center non-selectable">
    <!-- <div class="flex row text-h1 items-center">{{ word.word }}</div> -->

    <div id="dragDiv" class="absolute text-h6 z-max" style="top: 100px">
      Or Draggable like this?
    </div>

    <div class="flex row q-pa-md justify-center fit no-wrap hidden">
      <div
        v-for="(item, i) in grid"
        :key="i"
        class="phonic-drag bg q-mx-sm"
        style="cursor: move; position: relative"
        :class="item.class"
      >
        <div class="absolute-full" style="top: 4px">
          <q-icon name="mdi-drag-horizontal" size="sm"></q-icon>
          <!-- <q-icon name="mdi-swap-horizontal"></q-icon> -->
        </div>
        <div style="position: relative">
          <div
            class="absolute-full flex justify-center items-center content-center"
            style="font-size: 60px"
          >
            <span v-if="item.name === '^'">
              <q-icon name="mdi-ghost-outline" style="font-size: 60px"></q-icon
            ></span>
            <span v-else> {{ item.name }}</span>
          </div>
          <div class="invisible">
            <q-icon name="mdi-ghost-outline" style="font-size: 60px"></q-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="flex" style="position: relative">
      <div class="absolute fit flex" style="z-index: -1">
        <div class="flex row full-width items-center justify-center no-wrap">
          <div
            v-for="item in grid"
            :key="item.id"
            class="phonic-drag q-mx-sm"
            style="background: transparent; position: relative"
          >
            <div
              class="absolute-full flex justify-center items-center content-center"
            >
              <div class="full-height" style="border: dashed 2px grey"></div>
            </div>
            <div
              class="absolute-full flex justify-center items-center content-center"
            >
              <!-- <q-icon name="mdi-help" size="md" color="grey"></q-icon> -->
              <!-- <q-icon name="mdi-check" size="xl" color="green"></q-icon> -->
              <!-- <q-icon name="mdi-close" size="xl" color="red"></q-icon> -->
            </div>
            <q-icon
              class="invisible"
              name="mdi-arrow-up"
              style="font-size: 60px"
              color="grey"
            ></q-icon>
          </div>
        </div>
        <!-- <div class="flex row full-width">hello</div> -->
      </div>

      <VueDraggable
        class="flex row q-pa-md justify-center fit no-wrap"
        v-model="grid"
        animation="150"
        :sort="true"
        ghostClass="ghost"
        chosenClass="chosen"
        :group="{
          name: 'shared',
          pull: true,
          put: true,
        }"
      >
        <div
          v-for="(item, i) in grid"
          :key="i"
          class="phonic-drag bg-white q-mx-sm"
          style="cursor: move; position: relative"
          :class="{ hidden: i >= grid.length }"
        >
          <div class="absolute-full" style="top: 4px">
            <q-icon name="mdi-drag-horizontal" size="sm"></q-icon>
            <!-- <q-icon name="mdi-swap-horizontal"></q-icon> -->
          </div>
          <div style="position: relative">
            <div
              class="absolute-full flex justify-center items-center content-center"
              style="font-size: 60px"
            >
              <span v-if="item.name === '^'">
                <q-icon
                  name="mdi-ghost-outline"
                  style="font-size: 60px"
                ></q-icon
              ></span>
              <span v-else> {{ item.name }}</span>
            </div>
            <div class="invisible">
              <q-icon name="mdi-ghost-outline" style="font-size: 60px"></q-icon>
            </div>
          </div>
        </div>
      </VueDraggable>

      <div class="flex row q-pa-md justify-center fit no-wrap">
        <div v-for="(pattern, i) in icon_pattern" :key="i" class="q-mx-sm">
          <div
            class="cursor-pointer phonic-input-icon bg-white floating"
            @click="pressIcon(pattern, i)"
          >
            <div v-if="pattern.icon == null" :class="iconClass(pattern, i)">
              <q-icon
                class="invisible"
                name="mdi-ghost"
                style="font-size: 60px"
              ></q-icon>
            </div>

            <div
              v-else-if="pattern.icon.src === undefined"
              :class="iconClass(pattern, i)"
            >
              <q-icon :name="pattern.icon" style="font-size: 60px"></q-icon>
            </div>
            <div v-else :class="iconClass(pattern, i)">
              <q-icon style="font-size: 60px">
                <img :src="pattern.icon.src" type="image/svg+xml" />
              </q-icon>
            </div>
            <!--
            <q-badge v-if="pattern.letters.includes('^')" floating
              >ghost</q-badge
            > -->
          </div>
          <div class="mt-md hidden">
            <q-btn
              icon="mdi-volume-high"
              flat
              :disable="press_index != i"
            ></q-btn>
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
    };
  },
  mounted() {
    this.dragTest();
    // console.log("mounted");
    this.makeGrid();

    let pattern = [];
    for (let idx = 0; idx < this.word.pattern.length; idx++) {
      const element = this.word.pattern[idx];

      pattern.push(element);
      this.icon_pattern = pattern;
    }
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
      let input = [];
      for (let idx = 0; idx < pattern.length; idx++) {
        const element = pattern[idx];
        grid.push({
          name: element.letters,
          id: idx,
          input: element.input,
          class: element.input
            ? "col-auto drag text-weight-bold"
            : "col-auto drag ",
        });

        input.push({
          name: "?",
          id: "?" + idx,
        });
        // if (element.input && element.letters.includes("-")) {
        //   map_pattern.push(element.letters.replace("-", ""));
        // } else {
        //   map_pattern.push(element.letters);
        // }
      }
      //^exists because of words like one.. ^one
      // this.map_pattern = map_pattern.join("").replaceAll("^", "");

      this.input = input;
      this.map_pattern = this.word.pattern;

      shuffle(grid);
      this.grid = grid;
    },

    checkWord() {
      // let w = this.input
      //   .map((e) => (e.name === "-" ? "_" : e.name))
      //   .join("")
      //   .split(" ")[0];

      let w = this.grid
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
        classes.push(" disabled no-pointer-events");
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
    },
    iconClass(pattern, index) {
      return "";
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

    playSound() {
      var audio = new Audio("path/to/allow_sound.mp3"); // replace 'path/to/allow_sound.mp3' with the actual path to your sound file
      // Play the sound
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
      console.log("remove", e);
      return;
      e.item.classList.add("disabled");
      e.item.classList.add("no-pointer-events");
    },
    onClone() {
      console.log("clone");
    },

    onEnd(e) {
      console.log("onend", e);
    },

    onChange(e) {
      console.log("onchanbge", e);
    },

    onMove(e) {
      console.log("onmoev", e);
    },

    onSort(e) {
      console.log("onsort", e);
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

    dragTest() {
      function dragElement(elmnt) {
        var pos1 = 0,
          pos2 = 0,
          pos3 = 0,
          pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
          // if present, the header is where you move the DIV from:
          document.getElementById(elmnt.id + "header").onmousedown =
            dragMouseDown;
        } else {
          // otherwise, move the DIV from anywhere inside the DIV:
          elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elmnt.style.top = elmnt.offsetTop - pos2 + "px";
          elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
        }

        function closeDragElement() {
          // stop moving when mouse button is released:
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }
      dragElement(document.getElementById("dragDiv"));
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
  background: red !important;
  border-radius: 100px !important;
  opacity: 0 !important;
}
.ghost {
  background: white !important;
  opacity: 1 !important;
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
