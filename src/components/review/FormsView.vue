<template>
  <div class="flex column full-width">
    <div class="full-width flex row">
      <q-btn
        flat
        no-caps
        @click="
          actual_words.length < 1
            ? getActualWords()
            : (show_loaded = !show_loaded)
        "
        >Load forms</q-btn
      >
      <q-space></q-space>
      <q-btn flat no-caps @click="show_hidden = !show_hidden" size="sm">
        <q-icon :name="show_hidden ? 'mdi-eye' : 'mdi-eye-off'"></q-icon>
        <q-tooltip>Show words not on any of our lists</q-tooltip>
      </q-btn>
    </div>

    <div
      v-if="actual_words.length > 0 && show_loaded"
      class="q-my-sm q-gutter-sm"
    >
      <!--  -->

      <div
        v-for="actual in actual_words.sort(
          (a, b) => a.pids.length - b.pids.length
        )"
        :key="actual.id"
      >
        <div class="flex row full-width items-center">
          <span class="col-2">{{ actual.word }}</span>
          <GraphemesView
            :ref="actual.id + '-review'"
            class="col-grow"
            :class="{
              'bg-orange-6': !actual.pids.toString().includes(pids.toString())
                ? true
                : false,
            }"
            :letters="actual.lids"
            :pids="actual.pids"
            :stress="actual.stress"
            :variation_index="actual.select_variation"
            :search_phonemes="[]"
            :approvals="actual.approved_1"
            :word="actual.word"
            :id="actual.id"
            @changeVariation="(e) => (actual.select_variation = e)"
            :form_changes="form_changes"
            @changes="(e) => (form_changes = e)"
          ></GraphemesView>
          <q-btn
            :disable="actual.approve_au || actual.approved"
            no-caps
            flat
            color="green"
            size="sm"
            @click="approve(actual)"
          >
            {{ actual.approve_au || actual.approved ? "Approved" : "Approve" }}
          </q-btn>
          <div v-if="actual.approve_au || actual.approved">
            <q-icon name="mdi-check-circle" color="green" size="md"></q-icon>
          </div>
        </div>
      </div>
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
            <q-badge
              v-if="
                actual_words.length > 0 &&
                !actual_words.map((e) => e.word_id).includes(form.i)
              "
              floating
              color="warning text-black"
            >
              +
            </q-badge>

            <q-tooltip>
              <div v-for="(tag, iii) in form.t" :key="iii">
                {{ getWordTag(tag) }}
              </div>
              <div
                v-if="
                  actual_words.length > 0 &&
                  !actual_words.map((e) => e.word_id).includes(form.i)
                "
              >
                Not in list but (maybe) add.
              </div>
            </q-tooltip>
          </q-chip>
        </div>
      </div>
    </div>

    <q-separator />
    <div>
      <q-btn class="q-mt-sm" no-caps flat @click="getMore()">More forms</q-btn>
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
          <q-chip> {{ form.w }} </q-chip>
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

import GraphemesView from "/src/components/review/GraphemesView.vue";

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
    GraphemesView,
    // MoveLetters
  },
  props: {
    forms: { required: true },
    other: { required: true },
    word: { required: true },
    row: { required: true },
    pids: { required: true },
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
      actual_words: [],
      show_loaded: false,
      form_changes: [],
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
      this.show_loaded = true;
      // console.log(this.forms);

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
      approved_1(id),words(sim), approve_au`;

      let query = supabase.from("combine").select(select);

      if (or.length > 0) {
        query = query.or(or);
      } else {
        return;
      }

      const { data, count, error } = await query;

      if (data === null) return;
      console.log("data", data);
      // this.more_data = data;
      this.actual_words = data;
    },

    async approve(word) {
      //
      console.log(word);
      await this.markCorrectCOMBINE(word);
    },

    async markCorrectCOMBINE(word) {
      if (word["approve_loading"]) {
        return;
      }
      word["approve_loading"] = true;
      let session = await supabase.auth.getSession();
      let email = session?.data?.session.user.email;

      let combine_id = word.id;
      let word_id = word.word_id;
      let by = [email];

      let insert_data = {
        word_id: word_id,
        combine_id: combine_id,
        by: by,
      };

      let view = undefined;
      view = this.$refs[combine_id + "-review"];

      if (view[0] === undefined) {
        return;
      }

      let given_pids = view[0].pids;
      let current_pids = view[0].use_pids;

      if (given_pids.toString() !== current_pids.toString()) {
        insert_data["pids_changed"] = true;
        this.trackMods({
          data: insert_data,
          type: "phoneme",
          from_pids: given_pids,
          to_pids: current_pids,
        });
      }

      let current_letters = view[0].ordered_letters[view[0].variation_index];
      let letters_changed = view[0].letters_changed;
      if (letters_changed) {
        insert_data["lids_changed"] = true;
      } else if (view[0].letters.length > 1) {
        // note down letters.. or
      }

      // console.log("current_letters", current_letters);

      if (view[0].valid_letters === false) {
        alert("non valid letters");
        return;
      }

      insert_data["pids"] = current_pids;
      insert_data["lids"] = current_letters;

      console.log("insert_data", insert_data);

      let error = await this.approveRecord(word, insert_data);
      if (error !== null) {
        return;
      }

      await this.approveTable(insert_data);
      word["approve_loading"] = false;
      word["approved"] = true;
    },

    async approveRecord(word, insert_data) {
      let update = {
        id: word.id,
        approve_au: true,
        lids: [insert_data["lids"]],
      };
      if (insert_data["pids_changed"]) {
        update["pids"] = insert_data["pids"];
        update["pids_reject"] = word.pids;
      }
      const { data, error } = await supabase.from("combine").upsert(update);

      return error;
    },

    async approveTable(insert_data) {
      let check = await this.checkExistsCOMBINE(insert_data);
      if (check !== null && check.length > 0) {
        let update_data = insert_data;
        update_data["id"] = check[0].id;
        update_data["by"] = [...insert_data.by, ...check[0].by];
        const { data, error } = await supabase
          .from("approved_1")
          .upsert(update_data);
        console.log("update error", error);
        console.log("update data", data);
      } else {
        const { data, error } = await supabase
          .from("approved_1")
          .insert(insert_data);

        console.log("error", error);
        console.log("data", data);
      }
    },

    async checkExistsCOMBINE(insert_data) {
      const { data, error } = await supabase
        .from("approved_1")
        .select()
        .eq("word_id", insert_data.word_id)
        .eq("combine_id", insert_data.combine_id);

      return data;
    },

    async trackMods(payload) {
      // setup table to insert..
      // console.log("track mods", payload);
      if (payload.type === "phoneme") {
        function compareArrays(fromArray, toArray) {
          const outputArray = [];
          for (let i = 0; i < fromArray.length; i++) {
            if (fromArray[i] !== toArray[i]) {
              outputArray.push({
                from: fromArray[i],
                to: toArray[i],
                // index: i,
              });
            }
          }

          return outputArray;
        }

        // Example usage:
        const fromArray = payload.from_pids;
        const toArray = payload.to_pids;

        if (fromArray.length !== toArray.length) {
          return;
        }

        const compare_results = compareArrays(fromArray, toArray);
        // console.log(compare_results); // Output: [{ from: '1', to: '2', index: 0 }]

        for (let index = 0; index < compare_results.length; index++) {
          const result = compare_results[index];
          let check = await this.checkModExists(result);
          if (check.length > 0) {
            let update_data = check[0];
            update_data["count"] = parseInt(update_data["count"]) + 1;
            const { data, error } = await supabase
              .from("mods")
              .upsert(update_data);
            console.log("update error", error);
            console.log("update data", data);
          } else {
            const { data, error } = await supabase
              .from("mods")
              .insert({ ...result, count: 1 });
            console.log("error", error);
            console.log("data", data);
          }
        }
      } else {
      }
    },
    async checkModExists(compare_result) {
      const { data, error } = await supabase
        .from("mods")
        .select()
        .eq("from", compare_result.from)
        .eq("to", compare_result.to);

      return data;
    },
  },
});
</script>

<style></style>
