<template>
  <div class="flex flex-center q-pa-sm">
    <q-card
      v-for="(word, idx) in words"
      :key="idx"
      class="flex column items-center q-pa-sm q-ma-sm"
    >
      <!-- :class="{ selected: model_word != null && model_word.id === word.id }" -->
      <strong class="text-h4">{{ word.word }} </strong>
      <div class="text-caption">{{ word.type }}</div>

      <q-btn style="font-size: 20px" @click="selectWord(word)" flat>
        Select</q-btn
      >
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

export default defineComponent({
  name: "word-list",
  components: {},
  props: {
    words: { required: true },
    model_word: {},
    model_id: {},
  },
  data() {
    return {
      select_word: null,
      exclude: [],
    };
  },
  mounted() {
    //
  },
  methods: {
    selectWord(word) {
      this.select_word = word;
      // let set_word = { word: word.word, id: word.id };
      // this.$emit("update:model_word", set_word);
      // this.$emit("close");
      this.$emit("select", word);
    },
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
