<template>
  <div>
    <div class="flex row full-width">
      <q-btn @click="getGloss()" no-caps flat>Glosses</q-btn>
      <div v-if="show_glosses">
        <q-btn flat no-caps @click="max === 3 ? (max = 100) : (max = 3)">
          Expand
        </q-btn>
      </div>

      <div class="flex column full-width" v-if="show_glosses">
        <div v-for="(entry, i) in gloss_data" :key="i">
          <div class="flex row full-width">
            <div class="flex row full-width">
              <q-chip :color="$q.dark.mode ? 'teal-10' : 'teal-2'" size="md">
                {{ getPOS(entry.pos) }}

                <q-tooltip>
                  {{ getSenseTagInEntry(entry) }}
                </q-tooltip>
              </q-chip>
            </div>

            <div
              v-for="(gloss, ii) in entry.glosses.filter((e, i) => i < max)"
              :key="ii"
            >
              <li>{{ gloss.gloss }}</li>
              <ul
                v-if="
                  entry.more.filter(
                    (e) => e.gl0 === gloss.gloss && e.gl1 !== undefined
                  ).length > 0
                "
              >
                <li
                  v-for="(mo, iiii) in entry.more.filter(
                    (e) => e.gl0 === gloss.gloss && e.gl1 !== undefined
                  )"
                  :key="iiii"
                >
                  {{ mo.gl1 }}
                  <!-- <q-tooltip>
                    <div v-for="(tag, v) in mo.t" :key="v">
                      {{ getSenseTag(tag) }}
                    </div>
                  </q-tooltip> -->
                </li>
              </ul>
              <q-tooltip>
                <div v-for="(tag, iii) in gloss.t" :key="iii">
                  {{ getSenseTag(tag) }}
                </div>
              </q-tooltip>
            </div>

            <br />
          </div>
        </div>
      </div>
      <div class="q-my-sm full-width" v-if="show_glosses">
        <q-separator></q-separator>
        examples
      </div>
      <div class="flex column full-width" v-if="show_glosses">
        <div v-for="(entry, i) in examples" :key="i">
          <div class="flex row full-width">
            <div class="flex row full-width">
              <q-chip :color="$q.dark.mode ? 'teal-10' : 'teal-2'" size="md">
                {{ getPOS(entry.pos) }}

                <q-tooltip>
                  {{ getSenseTagInEntry(entry) }}
                </q-tooltip>
              </q-chip>
            </div>

            <div
              v-for="(example, ii) in entry.examples.filter((e, i) => i < max)"
              :key="ii"
            >
              <li>{{ example.ex.text }}</li>

              <q-tooltip>
                <div v-for="(tag, iii) in example.t" :key="iii">
                  {{ getSenseTag(tag) }}
                </div>
              </q-tooltip>
            </div>

            <br />
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

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

// import MoveLetters from "/src/components/animations/MoveLetters.vue";

import pos_options from "./pos-options-groups.json";
import word_tags from "./word-tag-ids.json";
import sense_tags from "./sense-tag-ids.json";

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
      word_tags,
      sense_tags,
    };
  },
  data() {
    return {
      pattern: [],
      mounted: false,
      icon_name: null,
      show_glosses: false,
      gloss_data: [],
      examples: [],
      max: 3,
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

    async getGloss() {
      this.show_glosses = !this.show_glosses;
      if (this.gloss_data.length > 0) {
        return;
      }
      let word = "example";
      if (this.word !== undefined) {
        word = this.word;
      }
      console.log(word);
      // console.log(this.row);
      let word_id = 1;
      if (this.row !== undefined) {
        word_id = this.row.word_id;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from("glosses")
        .select()
        // .textSearch("word", `${word}`)
        .eq("word_id", `${word_id}`)
        .limit(10);

      console.log("data", data);
      this.gloss_data = data;

      this.getExamples(supabase);
    },

    async getExamples(client) {
      if (this.examples.length > 0) {
        return;
      }

      let word_id = 1;
      if (this.row !== undefined) {
        word_id = this.row.word_id;
      }

      const supabase = client;
      const { data, error } = await supabase
        .from("examples")
        .select()
        // .textSearch("word", `${word}`)
        .eq("word_id", `${word_id}`)
        .limit(10);

      console.log("example data", data);
      this.examples = data;
    },

    getSenseTag(tag) {
      let tag_text = sense_tags.find((e) => e.i === tag);
      if (tag_text != undefined) {
        return tag_text.value;
      } else {
        return null;
      }
    },

    getSenseTagInEntry(entry) {
      return "todo";
      // let tag_text = sense_tags.find((e) => e.i === tag);
      // let entry_tags = [];

      // if (tag_text != undefined) {
      //   return tag_text.value;
      // } else {
      //   return null;
      // }
    },

    flagSenseTags(group) {
      if (group.msg === 1) {
        return false;
      }

      if (group.msg === 4) {
        return true;
      }

      let map = group.tags.map((e) => this.getSenseTag(e));

      if (group.bonus) {
        if (map.includes("slang")) return true;
        if (map.includes("historical")) return true;
        if (map.includes("rare")) return true;
        if (map.includes("obsolete")) return true;
      }

      return false;
    },
  },
});
</script>

<style></style>
