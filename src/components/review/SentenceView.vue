<template>
  <div class="flex row full-width">
    <!-- <q-input v-model="word" outlined label="word"></q-input> -->
    <q-select
      v-model="sentence_src"
      outlined
      flat
      dense
      :options="['sentences_nhermes', 'sentences_fairy', 'sentences10k']"
    ></q-select>
    <q-btn @click="getSentence()" flat no-caps>Get Sentence</q-btn>
    <q-btn
      v-if="sentences.length > 0"
      no-caps
      flat
      @click="show_sentences = !show_sentences"
      >Toggle</q-btn
    >

    <div class="flex row full-width" v-show="show_sentences">
      <div v-for="(data, i) in sentences" :key="i" class="q-my-md">
        <span
          v-for="(part, ii) in data.sentence.split(' ')"
          :key="ii"
          :class="{
            'text-bold text-blue': part.includes(word),
          }"
        >
          {{ `${part} ` }}
        </span>
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

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

// import MoveLetters from "/src/components/animations/MoveLetters.vue";

import pos_options from "./pos-options-groups.json";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL_EXTRA;
const supabaseAnonKey = process.env.SUPABASE_KEY_EXTRA;

export default defineComponent({
  // name: "forms",
  components: {
    // MoveLetters
  },
  props: {
    row: {},
    word: {},
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
      // word: "",
      sentences: [],
      show_sentences: false,
      sentence_src: "sentences_nhermes",
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

    async getSentence() {
      this.show_sentences = true;
      // if (this.sentences.length > 0) {
      //   return;
      // }
      let word = this.word;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        // .from("sentences10k")
        .from(this.sentence_src)
        .select()
        .textSearch("sentence", `${word}`)
        .limit(5);

      console.log("data", data);
      this.sentences = data;
    },
  },
});
</script>

<style></style>
