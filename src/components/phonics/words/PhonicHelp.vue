<template>
  <div class="fit column flex-center non-selectable">
    <!-- <div class="flex row text-h1 items-center">{{ word.word }}</div> -->
    <div class="flex column container full-width">
      <!-- <q-btn flat no-caps @click="test()">test</q-btn> -->
      <VueDraggable
        class="flex items-center flex-center"
        style="height: 100px; border: solid 1px; border-radius: 10px"
        v-model="input"
        animation="150"
        ghostClass="ghost"
        group="shared"
        @update="onUpdate"
        @add="onAdd"
        @remove="remove"
        @clone="onClone"
        @end="onEnd"
      >
        <span
          size="xl"
          class="text-h2"
          :class="
            correct
              ? 'animated pulse '
              : correct === false
              ? 'animated wobble'
              : ''
          "
          style="animation-duration: 2s"
          v-for="item in input"
          :key="item.id"
        >
          {{ item.name }}
        </span>
        <q-icon
          v-show="correct === true"
          class="q-ml-sm no-pointer-events"
          name="mdi-check-outline"
          color="green"
        ></q-icon>
        <q-icon
          v-show="correct === false"
          class="q-ml-sm no-pointer-events"
          name="mdi-close"
          color="red"
        ></q-icon>
      </VueDraggable>

      <VueDraggable
        class="row justify-center container q-mt-xl"
        v-model="grid"
        animation="150"
        :group="{
          name: 'shared',
          pull: 'clone',
          put: false,
        }"
        :sort="false"
        ghostClass="ghost"
        @update="onUpdate"
        @add="onAdd"
        @remove="remove"
      >
        <q-card
          v-for="item in grid"
          size="xl"
          :key="item.id"
          class="text-center q-pa-sm q-ma-sm text-h4"
          style="cursor: move"
          :class="item.class"
        >
          {{ item.name }}
        </q-card>
      </VueDraggable>
    </div>

    <div class="flex row q-pa-md justify-center fit q-gutter-x-m">
      <div v-for="(pattern, i) in word.pattern" :key="i">
        <div v-if="pattern.icon.src === undefined">
          <q-icon :name="pattern.icon" size="xl"></q-icon>
          <div class="q-mt-sm hidden">
            <!-- <q-icon
              v-for="(dot, idx) in pattern.dot"
              :key="idx"
              :name="
                dot === 1
                  ? 'mdi-checkbox-blank-circle'
                  : 'mdi-checkbox-blank-circle-outline'
              "
              size="xs"
            ></q-icon> -->
          </div>
        </div>
        <div v-else>
          <q-icon style="font-size: 80px">
            <img :src="pattern.icon.src" type="image/svg+xml" />
          </q-icon>
        </div>
      </div>
    </div>

    <q-btn
      no-caps
      class="q-my-xl bg-blue-5 hidden"
      size="xl"
      @click="checkWord()"
      :disable="input.length < 1"
    >
      <q-icon name="mdi-thumb-up-outline"></q-icon>
    </q-btn>

    <!-- <div>{{ input }}</div> -->

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
      grid: [],
      correct: null,
    };
  },
  mounted() {
    this.makeGrid();
  },
  methods: {
    makeGrid() {
      let grid = [];

      let pattern = this.word.pattern;
      for (let idx = 0; idx < pattern.length; idx++) {
        const element = pattern[idx];
        grid.push({
          name: element.letters,
          id: idx,
          class: element.input
            ? "col-auto drag text-weight-bold"
            : "col-auto drag ",
        });
      }

      shuffle(grid);
      this.grid = grid;
    },

    checkWord() {
      let final_word = this.input
        .map((e) => e.name)
        .join("")
        .split(" ")[0];

      let correct_word = this.word.word;
      console.log("final word", final_word);
      console.log("correcspelling", correct_word);

      let vm = this;
      if (final_word === correct_word) {
        this.correct = true;
        this.$emit("isCorrect", final_word);
        window.setTimeout(function () {
          vm.next();
        }, 2200);
      } else {
        this.correct = false;
        this.$emit("isIncorrect", final_word);
        window.setTimeout(function () {
          vm.setCorrect();
          vm.correct = "n";
          window.setTimeout(function () {
            vm.next();
          }, 2200);
        }, 2200);
      }

      // this.next();
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

    next() {
      this.correct = null;
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
    onAdd() {
      console.log("add");
    },
    remove(e) {
      // console.log("remove", e);
      e.item.classList.add("show_border");
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
.sortable-drag {
  background: black;
}
.ghost {
  background: red;
}
</style>
