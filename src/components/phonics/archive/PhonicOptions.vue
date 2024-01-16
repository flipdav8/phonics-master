<template>
  <div>
    <q-chip
      v-for="(v, idx) in shuffled_options"
      clickable
      @click="selectInput(v.label)"
      :outline="selected_input === v.label"
      size="lg"
      :key="idx"
    >
      {{ v.label }}
    </q-chip>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

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
  name: "phonic-options",
  components: {},
  props: {
    options: { required: true },
    selected_input: { required: true },
  },
  data() {
    return {
      shuffled_options: [],
    };
  },
  mounted() {
    this.shuffled_options = shuffle(this.options);
    let random =
      this.shuffled_options[
        Math.floor(Math.random() * this.shuffled_options.length)
      ].label;
    this.$emit("selectInput", random);
  },
  methods: {
    selectInput(input) {
      this.$emit("selectInput", input);
    },
  },
});
</script>
