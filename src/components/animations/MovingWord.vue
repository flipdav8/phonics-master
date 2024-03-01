<template>
  <div>
    <!-- <MoveLetters v-if="mounted" :options="pattern[0].options"></MoveLetters> -->
    <div class="flex row">
      <div v-for="(l, i) in pattern" :key="i">
        <!-- {{ l }} -->
        <MoveLetters :options="l.options" :letters="l.letters"></MoveLetters>
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

// import PHONEMES from "/src/components/icons/phonemes.js";
// const phonemes = PHONEMES.list;

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

import MoveLetters from "/src/components/animations/MoveLetters.vue";

export default defineComponent({
  name: "next-unit",
  components: { MoveLetters },
  props: {
    word: { required: true },
    phonemes: { required: true },
    letters: { required: true },
  },
  setup() {
    return {
      // phonemes,
    };
  },
  data() {
    return {
      pattern: [],
      mounted: false,
    };
  },
  mounted() {
    this.setupWord();
    this.mounted = true;
  },
  methods: {
    setupWord() {
      let pattern = [];
      for (let index = 0; index < this.phonemes.length; index++) {
        const ph = this.phonemes[index];
        pattern.push({
          letters: this.letters[index],
          options: shuffle(ph.more_spellings),
        });
      }
      this.pattern = pattern;
    },
  },
});
</script>

<style></style>
