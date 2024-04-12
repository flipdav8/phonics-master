<template>
  <div class="flex column items-center justify-center" dark>
    <!-- <q-btn @click="test()">Test</q-btn> -->
    <!-- <div>hello {{ products[1] }}</div> -->
    <!-- <q-btn no-caps @click="preferenceLetters">Pref test</q-btn> -->

    <!-- <SentenceView></SentenceView> -->
    <!-- <br /> -->
    <!-- <GlossView></GlossView> -->

    <q-card-section class="flex row q-gutter-sm">
      <q-select
        outlined
        v-model="restrict_to"
        :options="restrict_options"
        emit-value
      ></q-select>
      <q-select
        outlined
        v-model="filter_pos"
        :options="pos_options.map((e) => ({ value: e.i, label: e.value }))"
        multiple
        emit-value
        label="pos"
      ></q-select>
      <!-- <q-select
        outlined
        label="AND"
        v-model="from_lists"
        :options="list_options"
        emit-value
      ></q-select> -->
      <q-input
        outlined
        label="word"
        v-model="search_spelling"
        hint="% _"
      ></q-input>
      <q-select
        outlined
        v-model="search_phonemes"
        use-input
        option-label="label"
        input-debounce="0"
        :options="filteredOptions"
        use-chips
        multiple
        @filter="filterFn"
        :hint="`filter by phonemes`"
        style="width: 250px"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> Type.. </q-item-section>
          </q-item>
        </template>

        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <!-- <q-icon :name="scope.opt.icon" /> -->
              <component
                v-if="scope.opt.icon_name != undefined"
                :is="scope.opt.icon_name"
                :color="$q.dark.mode ? 'grey-1' : 'grey-10'"
                :label="false"
                :dots="false"
                :center="true"
                :scale="true"
                style="border-radius: 10px; font-size: 40px"
                class="overflow-hidden cursor-pointer"
              ></component>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <!-- <q-item-label caption>{{ scope.opt.description }}</q-item-label> -->
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-btn flat no-caps @click="makeNewSearchCOMBINE()">Search</q-btn>

      <q-space></q-space>
    </q-card-section>

    <q-spinner v-if="loading" color="primary" size="3em" />
    <q-card-section class="flex row q-gutter-sm items-center">
      <div v-if="search_count !== null">results = {{ search_count }}</div>
      <q-toggle v-model="show_grid">Show Grid</q-toggle>
      <q-toggle v-model="hide_approved">Hide Approved</q-toggle>
      <q-toggle v-model="hide_multi">Hide Multi</q-toggle>
    </q-card-section>

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="serverPagination.page"
        color="grey-8"
        :max="serverPages"
        :max-pages="6"
        size="sm"
        @update:model-value="changeServePage"
      />
    </div>

    <q-table
      class="fit"
      :rows="rows"
      :columns="columns"
      :pagination="initialPagination"
      :grid="show_grid"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              flat
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'mdi-chevron-down' : 'mdi-chevron-up'"
            />
          </q-td>

          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <!-- v-show="props.row.word !== 'aardvark'" -->
            <div
              v-show="
                (!hide_approved || !props.row.approved) &&
                (!hide_multi || !props.row.multi)
              "
            >
              <div v-if="col.name == 'lttrs'" class="column items-start">
                <GraphemesView
                  :ref="props.row.id + '-table'"
                  :letters="props.row.lids"
                  :pids="props.row.pids"
                  :stress="props.row.stress"
                  :variation_index="props.row.select_variation"
                  @changeVariation="
                    (e) => (rows[props.rowIndex].select_variation = e)
                  "
                  :search_phonemes="search_phonemes"
                  :approvals="props.row.approved_1"
                  :word="props.row.word"
                ></GraphemesView>
              </div>
              <div v-if="col.name == 'actions'">
                <span v-if="props.row.approved">
                  <q-icon
                    size="lg"
                    name="mdi-check"
                    color="green"
                    class="q-mx-sm"
                  ></q-icon>
                </span>

                <q-btn
                  v-if="!props.row.approve_loading"
                  :disable="props.row.multi || props.row.approved"
                  no-caps
                  flat
                  color="green"
                  @click="markCorrect(props)"
                  >Approve</q-btn
                >
                <q-spinner v-else color="primary" size="3em" />
              </div>

              <div v-else>{{ col.value }}</div>
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" :key="props.row.id">
          <q-td colspan="100%">
            <div>
              <!-- <MovingWord
                :word="props.row.word"
                :phonemes="props.row.phonemes"
                :letters="props.row.lttrs[0]"
              ></MovingWord> -->
              <br />
              look at prefixes, suffixes etc.. pos...
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-6"
          v-show="
            (!hide_approved || !props.row.approved) &&
            (!hide_multi || !props.row.multi)
          "
        >
          <q-card flat bordered :key="props.row.id">
            <q-card-section class="flex flex-center">
              <span v-if="props.row.approved">
                <q-icon
                  size="lg"
                  name="mdi-check"
                  color="green"
                  class="q-mx-sm"
                ></q-icon>
              </span>
              <q-space></q-space>
              <strong class="text-h5"> {{ props.row.word }}</strong>
              <q-space></q-space>

              <span
                v-if="!isNaN(props.row.sim)"
                :style="{
                  color: props.row.multi
                    ? 'grey'
                    : getColor(1 - props.row.sim / 100),
                }"
              >
                {{ props.row.sim }}</span
              >
            </q-card-section>
            <q-card-section class="full-width flex row">
              <q-icon
                name="mdi-alpha-l-circle"
                v-if="props.row.lemma"
                color="info"
              >
                <q-tooltip>Lemma (has inflected forms)</q-tooltip>
              </q-icon>
              <q-space></q-space>

              <q-icon
                v-if="props.row.tags.includes('m')"
                name="mdi-alpha-m-circle"
                color="orange-4"
              >
                <q-tooltip>Multiple-entries</q-tooltip>
              </q-icon>

              <q-icon
                v-if="
                  props.row.tags.includes('ht') ||
                  props.row.tags.includes('ht?')
                "
                name="mdi-alpha-h-circle"
                color="orange-3"
              >
                <q-tooltip
                  >Heteronym
                  {{
                    props.row.tags.includes("ht?") ? "(maybe)" : ""
                  }}</q-tooltip
                >
              </q-icon>

              <q-icon
                v-if="
                  props.row.tags.includes('hmg') ||
                  props.row.tags.includes('hmw') ||
                  props.row.tags.includes('hmr')
                "
                name="mdi-alpha-h-circle"
                color="red-2"
              >
                <q-tooltip>Homophone</q-tooltip>
              </q-icon>
              <POSview :word="props.row.word" :pos="props.row.pos"></POSview>
            </q-card-section>
            <q-separator />

            <q-card-section
              class="text-center flex row items-center justify-center"
            >
              <div
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                auto-width
              >
                <div v-if="col.name == 'lttrs'" class="column items-start">
                  <GraphemesView
                    :ref="props.row.id"
                    :letters="props.row.lids"
                    :pids="props.row.pids"
                    :stress="props.row.stress"
                    :variation_index="props.row.select_variation"
                    @changeVariation="
                      (e) => (rows[props.rowIndex].select_variation = e)
                    "
                    :search_phonemes="search_phonemes"
                    :approvals="props.row.approved_1"
                    :word="props.row.word"
                  ></GraphemesView>
                </div>
                <!-- <div v-else>{{ col.value }}</div> -->
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="flex row">
              <FormsView
                :forms="props.row.forms"
                :other="props.row.other"
                :word="props.row.word"
                :pids="props.row.pids"
                :row="props.row"
              ></FormsView>
            </q-card-section>

            <q-separator />

            <q-card-section class="flex row">
              <GlossView :row="props.row" :word="props.row.word"></GlossView>
              <q-separator />
              <SentenceView
                :row="props.row"
                :word="props.row.word"
              ></SentenceView>
            </q-card-section>

            <q-separator />
            <q-card-section class="flex row">
              <!-- <q-btn
                no-caps
                flat
                color="warning"
                >Incorrect</q-btn
              >
              <q-space></q-space>
              <q-btn
                no-caps
                flat
                color="grey"
                size="sm"
                >Skip</q-btn
              > -->
              <q-space></q-space>
              <q-btn
                v-if="!props.row.approve_loading"
                :disable="props.row.multi || props.row.approved"
                no-caps
                flat
                color="green"
                @click="markCorrectCOMBINE(props)"
                >Approve</q-btn
              >

              <q-spinner v-else color="primary" size="3em" />
            </q-card-section>
          </q-card>
          <br />
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";

import axios from "axios";

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

import CryptoJS from "crypto-js";

// import MovingWord from "/src/components/animations/MovingWord.vue";
import GraphemesView from "/src/components/review/GraphemesView.vue";
import FormsView from "/src/components/review/FormsView.vue";
import POSview from "/src/components/review/POSview.vue";
import GlossView from "/src/components/review/GlossView.vue";
import SentenceView from "/src/components/review/SentenceView.vue";

// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

import { supabase } from "src/components/supabase/supabase.js";

import pos_options from "/src/components/review/pos-options-groups.json";

export default defineComponent({
  name: "IndexPage2.1",
  components: {
    // MovingWord,
    GraphemesView,
    FormsView,
    POSview,
    GlossView,
    SentenceView,
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
      phonemes,
      pos_options,
    };
  },

  data() {
    return {
      serverPagination: {
        page: 1,
      },
      serverPages: 0,
      show_grid: true,
      hide_approved: false,
      hide_multi: false,
      search_spelling: "",
      search_phonemes: [],
      filteredOptions: [],
      filterFields: ["label"],

      syncdb: null,
      products: [],
      words: [],
      notes: [],
      columns: [
        {
          name: "word",
          field: "word",
          label: "word",
          sortable: true,
          align: "left",
        },

        {
          name: "lttrs",
          field: "lttrs",
          label: "result",
          sortable: true,
          align: "left",
        },

        {
          name: "actions",
          field: "actions",
          label: "Actions",
          align: "center",
        },
      ],
      rows: [],
      preloaded_rows: [],
      initialPagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 50,
        // rowsNumber: xx if getting data from a server
      },

      select_list: 0,
      ready_lists: [0, 1, 6],

      restrict_to: "list4",
      restrict_options: [
        {
          value: "list4",
          label: "list4",
        },
        {
          value: "any",
          label: "not list4",
        },
      ],
      from_lists: "list6",
      list_options: [
        {
          value: "list6",
          label: "list6",
        },
        // {
        //   value: "any",
        //   label: "any",
        // },
      ],

      filter_pos: [0, 1, 2, 3, 4],

      loading: false,
      search_count: null,
    };
  },
  mounted() {
    // this.$q.dark.set(true);
    // this.setup();
  },
  computed: {
    // pagesNumber() {
    //   return Math.ceil(this.rows.length / this.initialPagination.rowsPerPage);
    // },
  },
  methods: {
    async makeNewSearchCOMBINE(page) {
      this.loading = true;
      this.search_count = null;

      let records_per_page = 100;
      let page_number = 1;
      if (page !== undefined) page_number = page;
      let { from, to } = this.getPagination(page_number - 1, records_per_page);
      // from = 1;
      console.log("from", from);
      console.log("to", to);
      // return;

      let select = `id,word_id,word,pids,lids,pos,stress,lemma,tags,inlist0,inlist4,
      approved_1(id),words(sim),grammar_forms(*)`;
      // other_forms(forms)

      let restrict = "";
      if (this.restrict_to !== "any") {
        restrict = this.restrict_to.replace("list", "");
      }

      let spelling = "%%";

      if (this.search_spelling.length > 0) {
        spelling = `${this.search_spelling}`;
      }
      let filter_pids = this.search_phonemes.map((e) => e.list_id.toString());
      console.log(this.filter_pos);
      let filter_pos = this.filter_pos.map((e) => e.toString());

      const { data, count, error } = await supabase
        .from("combine")
        .select(select, { count: "exact" })
        .ilike("word", spelling)
        .contains("pids", filter_pids) //
        .overlaps("pos", filter_pos)
        // .eq("inlist0", false)
        .eq("inlist4", true)
        .eq("lemma", true)
        // .eq("inlist4", this.restrict_to === "list4" ? true : false)
        // .order("word", { ascending: true })
        .order("id", { ascending: true })
        .limit(records_per_page)
        // .range(1, 2);
        .range(from, to);

      this.serverPages = Math.ceil(count / records_per_page);

      console.log("data", data);
      console.log("count", count);
      console.log("error", error);
      if (data !== null) {
        this.rows = [];
        this.makeRowsCOMBINE(data, this.from_lists);
      }
      this.search_count = count;
      this.loading = false;
    },
    makeRowsCOMBINE(data, list) {
      let rows = [];

      for (let index = 0; index < data.length; index++) {
        const element = data[index];

        let row = {
          id: element.id,
          word_id: element.word_id,
          word: element.word,
          pos: element.pos,
          lemma: element.lemma,
          tags: element.tags,
          pids: element.pids,
          lids: element.lids,
          stress: element.stress,
          forms: element.grammar_forms,
          other: element.other_forms,
          sim: element.words.sim,
          approved_1: element.approved_1,
          approved:
            element.approved_1 == null
              ? false
              : element.approved_1.length > 0
              ? true
              : false,

          select_list: list.replace("list", ""),
          select_entry: 0,
          select_variation: 0,
          approve_loading: false,
          multi: false,
        };

        let multi_entry = data.filter((e) => e.word_id === element.word_id);
        if (multi_entry.length > 1) row["multi"] = true;

        rows.push(row);
      }

      // console.log("rows", rows);
      this.rows.push(...rows);
    },

    getColor(value) {
      //value from 0 to 1
      var hue = ((1 - value) * 120).toString(10);
      if (this.$q.dark.mode) {
        return ["hsl(", hue, ",100%,50%)"].join("");
      } else {
        return ["hsl(", hue, ",100%,30%)"].join("");
      }
    },

    test(props) {
      props.row.select_list = 22;
      console.log("test", props.row.select_list);
    },

    changeSelectList(props, list) {
      this.rows[props.rowIndex].select_list = list;
      this.select_entry = 0;
      this.select_variation = 0;
    },

    changeEntry(props, entry_length) {
      this.rows[props.rowIndex].select_entry++;

      if (this.rows[props.rowIndex].select_entry > entry_length - 1) {
        this.rows[props.rowIndex].select_entry = 0;
      }

      this.select_variation = 0;
    },

    preferenceLetters() {
      let arrays = [
        ["th", "re", "^"],
        ["th", "re", "e"],
        ["th", "r", "ee"],
      ];

      // Define your preference order
      let preference = {
        r: 1,
        re: 2,
        e: 2,
        ee: 1,
        "^": 100,
      };

      // Sort the arrays
      arrays.sort((a, b) => {
        for (let i = 0; i < a.length; i++) {
          if (preference[a[i]] !== preference[b[i]]) {
            return preference[a[i]] - preference[b[i]];
          }
        }
      });

      console.log(arrays);
    },

    async markCorrectCOMBINE(props) {
      if (props.row["approve_loading"]) {
        return;
      }
      props.row["approve_loading"] = true;
      let session = await supabase.auth.getSession();
      // console.log("session", session?.data?.session.user.email);

      let email = session?.data?.session.user.email;
      // console.log("props", props);

      let combine_id = props.row.id;
      let word_id = props.row.word_id;
      let list = "list" + props.row.select_list;
      // let list_id = props.row[list][props.row.select_entry].id;
      let by = [email];

      let insert_data = {
        word_id: word_id,
        combine_id: combine_id,
        // list: list,
        // list_id: list_id,
        by: by,
      };

      // insert_data[list + "_id"] = list_id;

      let view = undefined;
      if (this.show_grid) {
        view = this.$refs[combine_id];
      } else {
        view = this.$refs[combine_id + "-table"];
      }

      if (view[0] === undefined) {
        return;
      }

      let given_pids = view[0].pids;
      let current_pids = view[0].use_pids;

      if (given_pids.toString() !== current_pids.toString()) {
        insert_data["pids_changed"] = true;
        // console.log("pids changed");
        // console.log("from", given_pids);
        // console.log("to", current_pids);
        // track type of changes so we can learn from themm.. todo.
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
        // this.trackMods({
        //   data: insert_data,
        //   type: "letters",
        //   lids: current_letters,
        // });
      } else if (view[0].letters.length > 1) {
        // note down letters.. or
      }

      console.log("current_letters", current_letters);

      if (view[0].valid_letters === false) {
        alert("non valid letters");
        return;
      }

      insert_data["pids"] = current_pids;
      insert_data["lids"] = current_letters;

      console.log("insert_data", insert_data);

      // return;

      let check = await this.checkExistsCOMBINE(insert_data, list);
      console.log("check", check);
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

      props.row["approve_loading"] = false;
      props.row["approved"] = true;
    },
    async checkExistsCOMBINE(insert_data, list) {
      const { data, error } = await supabase
        .from("approved_1")
        .select()
        .eq("word_id", insert_data.word_id)
        .eq("combine_id", insert_data.combine_id);

      return data;
    },

    async trackMods(payload) {
      // setup table to insert..
      console.log("track mods", payload);
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

    filterFn(val, update, abort) {
      update(() => {
        let options = phonemes.filter(
          (e) =>
            e.icon_name != undefined || e.extra || e.redo_round || e.include
        );

        if (!val) {
          this.filteredOptions = options;
          return;
        }

        let filterValue = val.toLowerCase();

        this.filteredOptions = options.filter((v) => {
          let targetValue = "";
          this.filterFields.forEach((field) => {
            targetValue += v[field].toLowerCase();
          });
          return targetValue.indexOf(filterValue) > -1;
        });
      });
    },

    getPagination(page, size) {
      const limit = size ? +size : 3;
      const from = page ? page * limit : 0;
      const to = page ? from + size - 1 : size - 1;

      return { from, to };
    },
    changeServePage() {
      // console.log("this.ser", this.serverPagination);
      this.rows = [];
      this.makeNewSearchCOMBINE(this.serverPagination.page);
    },
  },
});
</script>
