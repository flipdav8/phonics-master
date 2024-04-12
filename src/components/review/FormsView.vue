<template>
  <div class="flex column full-width">
    <div class="full-width flex row">
      <q-btn flat no-caps @click="getActualWords()">Load</q-btn>
      <q-space></q-space>
      <q-btn flat no-caps @click="show_hidden = !show_hidden" size="sm">
        <q-icon name="mdi-eye"></q-icon>
      </q-btn>
    </div>
    <div v-for="(group, i) in forms" :key="i">
      <div
        class="flex row full-width q-my-xs items-center"
        :class="{
          hidden: !show_hidden && flagSenseTags(group),
        }"
      >
        <q-chip :color="$q.dark.mode ? 'teal-10' : 'teal-2'" size="md">
          {{ getPOS(group.pos) }}:

          <q-badge v-if="group.bonus" color="yellow" floating></q-badge>
          <q-badge v-if="flagSenseTags(group)"></q-badge>
          <q-tooltip>
            <div v-for="(tag, iii) in group.tags" :key="iii">
              {{ getSenseTag(tag) }}
            </div>
          </q-tooltip>
        </q-chip>

        <div v-for="(form, ii) in group.forms" :key="ii">
          <q-chip
            :class="{
              'text-grey': form.i === null,
              'text-strike': flagWordTags(form.t),
              hidden: !show_hidden && flagWordTags(form.t),
            }"
          >
            {{ form.w }}
            <q-tooltip>
              <div v-for="(tag, iii) in form.t" :key="iii">
                {{ getWordTag(tag) }}
              </div>
            </q-tooltip>
          </q-chip>
        </div>
      </div>
    </div>
    <q-separator />
    <div>
      <q-btn class="q-mt-sm" no-caps flat @click="getMore()">More</q-btn>
    </div>
    <!-- v-if="other != undefined && other.length > 0" -->
    <div v-if="more_data.length > 0 && show_more" class="flex row full-width">
      <div class="flex row full-width show_borders">
        <div
          v-for="(form, i) in more_data[0].forms"
          :key="i"
          class="q-mx-sm"
          :class="{
            'text-grey': form.i == null,
            hidden: !show_hidden && form.i == null,
          }"
        >
          <q-chip>
            {{ form.w }}
          </q-chip>
        </div>
      </div>

      <div v-if="more_data[0].homophones.length > 0" class="full-width q-my-sm">
        <q-separator class="q-my-sm" />
        Homophones
      </div>

      <div
        class="flex row full-width"
        v-if="more_data[0].homophones.length > 0"
      >
        <div
          v-for="(form, i) in more_data[0].homophones"
          :key="i"
          class="q-mx-sm"
        >
          <q-chip :color="$q.dark.mode ? 'teal-10' : 'teal-2'" size="md">
            {{ getPOS(JSON.parse(form).pos) }}
          </q-chip>

          <q-chip v-for="(wor, iii) in JSON.parse(form).words" :key="iii">
            {{ wor }}
          </q-chip>
        </div>
      </div>

      <q-separator class="full-width q-my-sm" />
      <q-btn class="q-mt-sm" no-caps flat @click="show_extra = !show_extra">
        phrases
      </q-btn>
      <div class="flex row full-width" v-if="show_extra">
        <div
          v-for="(form, i) in more_data[0].multi"
          :key="i"
          class="q-mx-sm"
          :class="{
            'text-grey': form.i.length === 0,
            hidden: !show_hidden && form.i.length === 0,
          }"
        >
          <q-chip> {{ form.w }}</q-chip>
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

import { supabase } from "src/components/supabase/supabase.js";

let message_types = [
  {
    value: "same",
    i: 0,
  },
  {
    value: "list3",
    i: 1,
  },
  {
    value: "unknown",
    i: 2,
  },
  {
    value: "nothing",
    i: 3,
  },
  {
    value: "missing",
    i: 4,
  },
];

export default defineComponent({
  // name: "forms",
  components: {
    // MoveLetters
  },
  props: {
    forms: { required: true },
    other: { required: true },
    word: { required: true },
    row: { required: true },
  },
  setup() {
    return {
      // phonemes,
      message_types,
      pos_options,
      word_tags,
      sense_tags,
    };
  },
  data() {
    return {
      mounted: false,
      show_hidden: false,
      show_more: false,
      show_extra: false,
      more_data: [],
    };
  },
  mounted() {
    // this.setupWord();
    this.mounted = true;
  },
  computed() {},
  methods: {
    getPOS(pos) {
      let pos_text = pos_options.find((e) => e.i === pos);
      if (pos_text != undefined) {
        return pos_text.value;
      } else {
        return null;
      }
    },
    getWordTag(tag) {
      let tag_text = word_tags.find((e) => e.i === tag);
      if (tag_text != undefined) {
        return tag_text.value;
      } else {
        return null;
      }
    },

    getSenseTag(tag) {
      let tag_text = sense_tags.find((e) => e.i === tag);
      if (tag_text != undefined) {
        return tag_text.value;
      } else {
        return null;
      }
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

    flagWordTags(tags) {
      let map = tags.map((e) => this.getWordTag(e));
      if (map.includes("archaic")) {
        return true;
      }

      if (map.includes("nonstandard")) {
        return true;
      }

      if (map.includes("dialectal")) {
        return true;
      }

      return false;
    },

    async getMore() {
      this.show_more = !this.show_more;
      if (this.more_data.length > 0) {
        return;
      }
      console.log("this.row", this.row);

      let combine_id = this.row.id;

      if (combine_id == undefined) return;

      const { data, count, error } = await supabase
        .from("other_forms")
        .select("forms, multi, homophones", { count: "exact" })
        // .ilike("word", spelling)
        // .contains("pids", filter_pids) //
        // .overlaps("pos", filter_pos)
        .eq("combine_id", combine_id)
        // .eq("inlist4", this.restrict_to === "list4" ? true : false)
        // .order("word", { ascending: true })
        // .order("id", { ascending: true })
        .limit(10);

      console.log("data", data);
      this.more_data = data;
    },

    async getActualWords() {
      console.log(this.forms);

      let all_forms = [];
      for (let index = 0; index < this.forms.length; index++) {
        const element = this.forms[index];
        all_forms.push(
          ...element.forms.filter((e) => e.i !== null).map((e) => e.i)
        );
      }

      let or = all_forms.map((e) => `word_id.eq.${e}`).join(",");

      console.log("all_forms (or)", or);

      // let select = `id,word_id,word,pids,lids,pos,stress,lemma,tags,inlist0,inlist4,
      // approved_1(id),words(sim),grammar_forms(*)`;
      let select = `id,word_id,word,pids,lids,pos,stress,lemma,tags,inlist0,inlist4,
      approved_1(id),words(sim)`;

      const { data, count, error } = await supabase
        .from("combine")
        .select(select)
        .or(or);
      // .ilike("word", spelling)
      // .contains("pids", filter_pids) //
      // .overlaps("pos", filter_pos)
      // .eq("combine_id", combine_id)
      // .eq("inlist4", this.restrict_to === "list4" ? true : false)
      // .order("word", { ascending: true })
      // .order("id", { ascending: true })
      // .limit(10);

      console.log("data", data);
      // this.more_data = data;
    },
  },
});
</script>

<style></style>
