<template>
  <div class="flex row full-width">
    <div class="flex row" v-for="(group, idx) in pos" :key="idx">
      <!-- {{ group }} -->
      <q-chip
        v-for="pos in group.pos"
        :key="pos"
        :color="$q.dark.mode ? 'teal-10' : 'teal-2'"
        size="md"
      >
        {{ getPOS(pos) }}
      </q-chip>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

// import MoveLetters from "/src/components/animations/MoveLetters.vue";

import pos_options from "./pos-options-groups.json";

export default defineComponent({
  // name: "forms",
  components: {
    // MoveLetters
  },
  props: {
    pos: { required: true },
    word: { required: true },
  },
  setup() {
    return {
      pos_options,
    };
  },
  data() {
    return {
      pattern: [],
      mounted: false,
      icon_name: null,
    };
  },
  mounted() {
    // this.setupWord();
    this.mounted = true;
  },
  computed() {},
  methods: {
    getPOS(pos) {
      let pos_text = pos_options.find((e) => e.i == pos);
      if (pos_text != undefined) {
        return pos_text.value;
      } else {
        return null;
      }
    },
  },
});
</script>

<style></style>
