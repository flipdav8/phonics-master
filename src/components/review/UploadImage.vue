<template>
  <div class="flex row items-center">
    <q-icon name="mdi-image" @click="show_images = !show_images"></q-icon>
    <!-- {{ row.id }} -->

    <div v-if="show_images" class="flex row items-center full-width">
      <!-- <q-btn no-caps flat @click="listImages()">List</q-btn> -->
      <q-input
        v-model="search"
        @blur="listImages()"
        outlined
        dense
        label="search"
      ></q-input>
      <q-select
        v-if="files.length > 0"
        :options="files"
        v-model="select"
        outlined
        dense
        multiple
      ></q-select>

      <q-file
        v-if="files.length < 1"
        outlined
        v-model="file_img"
        label="Attach Image"
        dense
      />

      <q-btn
        no-caps
        flat
        @click="uploadImage()"
        :disabled="file_img == null && select.length < 1"
      >
        Upload
      </q-btn>

      <!-- <q-btn flat no-caps color="warning" @click="clearImages()">Clear</q-btn> -->
    </div>
    <div v-if="show_images" class="flex row items-center q-mt-sm">
      <!-- <q-img
        class="q-mt-md"
        :src="`https://icspkjuoqnyhkcccstgp.supabase.co/storage/v1/object/public/images/words/air.svg`"
        fit="cover"
        style="left: 0px; height: 100%; width: 70px"
      ></q-img> -->

      <div v-for="(n, i) in file_paths" :key="i">
        <q-img
          :src="`https://icspkjuoqnyhkcccstgp.supabase.co/storage/v1/object/public/images/${n}`"
          style="left: 0px; height: 100%; width: 70px"
          fit="cover"
        ></q-img>
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
import word_tags from "./word-tag-ids.json";
import sense_tags from "./sense-tag-ids.json";

import { createClient } from "@supabase/supabase-js";

import { supabase } from "src/components/supabase/supabase.js";

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
      word_tags,
      sense_tags,
    };
  },
  data() {
    return {
      mounted: false,
      file_img: null,
      file_paths: [],
      files: [],
      select: [],
      show_images: true,
      search: "",
    };
  },
  mounted() {
    // this.setupWord();

    if (this.row.imgs != null) {
      this.file_paths = this.row.imgs;
    }
    this.search = this.word;
    this.listImages();
    this.mounted = true;
  },
  computed() {},
  methods: {
    async listImages() {
      const { data, error } = await supabase.storage
        .from("images")
        .list("words", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
          search: this.search,
        });

      this.files = data
        .filter((e) => e.name !== ".emptyFolderPlaceholder")
        .map((e) => `${e.name}`);
      // console.log("data", this.files);
    },

    async uploadImage() {
      if (this.select.length > 0) {
        this.updateWord(this.select);
        return;
      }
      // console.log("this.file_img", this.file_img);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`words/${this.file_img.name}`, this.file_img);
      if (error) {
        // Handle error
        console.log("error", error);
      } else {
        // Handle success
        console.log("uploaded", data);
        this.file_paths.push(data.path);
        this.updateWord(data.path);
      }
    },

    async updateWord(path) {
      let img_update = this.file_paths;
      // if (this.row.imgs !== null) img_update = this.row.imgs;
      if (Array.isArray(path)) {
        img_update.push(...path.map((e) => `words/${e}`));
      } else {
        img_update.push(path);
      }
      // let update = {
      //   id: this.row.id,
      //   imgs: img_update,
      // };
      // console.log("update", update);

      const { data, error } = await supabase
        .from("combine")
        .update({ imgs: img_update })
        .eq("id", this.row.id)
        .select();

      console.log("data", data);
      console.log("error", error);
    },

    async clearImages() {
      const { data, error } = await supabase
        .from("combine")
        .update({ imgs: null })
        .eq("id", this.row.id)
        .select();

      console.log("data", data);
      console.log("error", error);
    },
  },
});
</script>

<style></style>
