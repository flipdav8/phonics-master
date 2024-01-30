<template>
  <q-card
    class="items-center q-pa-sm bg-blue-2 non-selectable"
    style="max-width: 1000px !important; border-radius: 20px"
  >
    <q-card-section
      class="col-12 flex row justify-center items-center q-gutter-x-sm"
    >
      <q-input outlined color="primary" v-model="search" label="search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        class="col-4"
        outlined
        label="type"
        v-model="type"
        :options="['all', 'sound', 'spelling']"
      ></q-select>

      <q-input outlined v-model="block_search" label="phoneme"></q-input>
      <q-chip
        v-if="block !== 'all'"
        square
        outline
        size="lg"
        removable
        @remove="block = 'all'"
      >
        {{ block.label }} block..
      </q-chip>
      <q-chip v-else square outline size="lg"> All Blocks </q-chip>

      <q-btn flat icon="mdi-close" @click="$emit('close')">Close</q-btn>
    </q-card-section>

    <div class="flex row justify-center q-gutter-x-md">
      <!-- <q-toggle v-model="multiselect" label="multiselect"></q-toggle> -->
      <q-btn @click="highlightAllWords()" color="green" no-caps>
        Highlight All {{ filterWords.length }}
      </q-btn>

      <q-btn
        :disable="selected.length < 1"
        @click="selectWords()"
        color="green"
        no-caps
      >
        Select Words</q-btn
      >
    </div>

    <q-card-section class="flex row justify-center">
      <q-card
        v-for="(word, idx) in filterWords"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-auto cursor-pointer"
        style="border-radius: 10px"
        :class="{
          selected: selected.map((e) => e.id).includes(word.id),
          disabled: selected_words.map((e) => e.id).includes(word.id),
        }"
        @click="selectWord(word)"
      >
        <!-- :class="{ selected: model_word != null && model_word.id === word.id }" -->
        <strong class="text-h4">{{ word.word }} </strong>
        <div class="text-caption">{{ word.type }}</div>
        <div class="text-caption">{{ word.block.label }}</div>

        <!-- <q-btn @click="selectWord(word)" color="green" no-caps> Select</q-btn> -->
        <br />
      </q-card>
    </q-card-section>
  </q-card>
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
    filter_type: {},
    filter_block: {},
    selected_words: {},
  },
  data() {
    return {
      select_word: null,
      exclude: [],
      search: "",
      block: "all",
      block_search: "",
      type: "all",
      multiselect: true,
      selected: [],
    };
  },
  mounted() {
    if (this.filter_type != undefined) {
      this.type = this.filter_type;
    }

    if (this.filter_block != null) {
      this.block = this.filter_block;
    }

    // this.selected = this.selected_words;
    // console.log("this.filter_block", this.filter_block);
  },
  computed: {
    filterWords() {
      return this.words.filter(
        (e) => this.typeFilter(e) && this.blockFilter(e) && this.searchFilter(e)
      );
    },
  },
  methods: {
    searchFilter(e) {
      // return e.label;
      return e.word
        .toLocaleLowerCase()
        .indexOf(this.search.toLocaleLowerCase()) > -1
        ? true
        : false;
    },
    typeFilter(e) {
      if (this.type === "all") {
        return true;
      } else {
        return e.type === this.type;
      }
    },
    blockFilter(e) {
      if (this.block_search.length > 1) {
        return (
          e.block != undefined && e.block.label.includes(this.block_search)
        );
      } else if (this.block === "all") {
        return true;
      } else {
        return e.block != undefined && e.block.id === this.block.id;
      }
    },
    selectWord(word) {
      if (this.selected_words.map((e) => e.id).includes(word.id)) {
        return;
      }
      if (this.multiselect) {
        if (this.selected.map((e) => e.id).includes(word.id)) {
          let r = this.selected.findIndex((e) => e.id === word.id);
          this.selected.splice(r, 1);
        } else {
          this.selected.push(word);
        }
      } else {
        this.select_word = word;
        // let set_word = { word: word.word, id: word.id };
        // this.$emit("update:model_word", set_word);
        // this.$emit("close");
        this.$emit("select", word);
      }
    },

    selectWords() {
      this.$emit("selectWords", this.selected);
    },

    highlightAllWords() {
      this.selected = this.filterWords;
    },
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
