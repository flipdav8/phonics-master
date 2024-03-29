<template>
  <q-page class="flex flex-center column" dark>
    <!-- <q-btn @click="test()">Test</q-btn> -->
    <!-- <div>hello {{ products[1] }}</div> -->
    <!-- <q-btn no-caps @click="preferenceLetters">Pref test</q-btn> -->
    <q-table
      class="fit"
      :rows="rows"
      :columns="columns"
      :pagination="initialPagination"
      grid
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
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            auto-width
          >
            <div v-if="col.name == 'lttrs'" class="column items-start">
              <!-- {{ props.row.list0[0].lids }} -->
              <!-- <GraphemesView
                v-if="props.row.list0.length > 0"
                :letters="props.row.list0[0].lids"
                :pids="props.row.list0[0].pids"
              ></GraphemesView> -->

              <!-- <GraphemesView
                v-if="props.row.list1.length > 0"
                :letters="props.row.list1[0].lids"
                :pids="props.row.list1[0].pids"
              ></GraphemesView> -->
            </div>
            <div v-else>{{ col.value }}</div>
            <!-- <div v-if="col.name == 'lttrs'" class="column items-start">
              <div class="column">
                <q-chip
                  class="col"
                  v-for="(p, i) in props.row.lttrs"
                  :key="i"
                  size="md"
                >
                  <span v-for="(pp, ii) in p" :key="ii">
                    {{ pp }}

                    <span v-if="ii < p.length - 1" class="q-mx-xs"> </span>
                  </span>
                </q-chip>
              </div>

              <div>
                <span v-for="(pattern, i) in props.row.phonemes" :key="'i' + i">
                  <span v-if="pattern.icon_name == undefined">
                    <q-icon
                      name="mdi-alert-rhombus-outline"
                      color="negative"
                      size="md"
                    ></q-icon>
                  </span>
                  <span v-else-if="pattern.icon_name != undefined">
                    <component
                      :is="pattern.icon_name"
                      :color="'grey-10'"
                      :label="false"
                      :dots="false"
                      :center="true"
                      :scale="true"
                      style="border-radius: 10px; font-size: 40px"
                      class="overflow-hidden"
                    ></component>
                  </span>
                </span>
              </div>
            </div>
            <div v-else-if="col.name === 'phonemes'">{{ col.name }}</div>
            <div v-else-if="col.name === 'actions'">
              <q-btn no-caps @click="addNote(props.row)">Add Note</q-btn>
            </div>
            <div v-else>{{ col.value }}</div> -->
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

              <div>
                {{ props.row }}
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered :key="props.row.id">
            <q-card-section class="flex flex-center">
              <span v-if="props.row.master1.length > 0">
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
                  color:
                    props.row.lists.length < 1
                      ? 'grey'
                      : getColor(1 - props.row.sim / 100),
                }"
              >
                {{ props.row.sim }}</span
              >
            </q-card-section>
            <q-card-section>
              <POSview :word="props.row.word" :pos="props.row.pos"></POSview>
            </q-card-section>
            <q-separator />
            <q-card-section
              class="text-center flex row items-center justify-center"
            >
              <div class="flex row col-12 justify-center q-mb-md">
                <q-chip
                  v-for="(list, idx) in props.row.lists"
                  :key="idx"
                  :outline="props.row.select_list == list"
                  clickable
                  :disable="
                    props.row['list' + list] == undefined ||
                    props.row['list' + list].length < 1
                  "
                  :class="
                    props.row['list' + list] == undefined ||
                    props.row['list' + list].length < 1
                      ? 'hiddens'
                      : ''
                  "
                  size="sm"
                  @click="changeSelectList(props, parseInt(list))"
                >
                  {{ list }}
                </q-chip>
              </div>
              <!-- <q-btn @click="test(props)">test</q-btn> -->

              <div
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                auto-width
              >
                <div v-if="col.name == 'lttrs'" class="column items-start">
                  <div v-for="list_look in ready_lists" :key="list_look">
                    <div v-if="list_look == props.row.select_list">
                      <div
                        v-for="(result, iii) in props.row['list' + list_look]"
                        :key="iii"
                      >
                        <!--  :letters="[result.lids[0], result.lids[0]]" -->
                        <GraphemesView
                          :ref="
                            props.row.id + '-' + 'list' + list_look + '-' + iii
                          "
                          v-show="iii === props.row.select_entry"
                          :letters="result.lids"
                          :pids="result.pids"
                          :stress="result.stress"
                          :variation_index="props.row.select_variation"
                          @changeVariation="
                            (e) => (rows[props.rowIndex].select_variation = e)
                          "
                        ></GraphemesView>
                      </div>

                      <div v-if="props.row['list' + list_look].length > 1">
                        <br />

                        <q-btn
                          flat
                          color="grey"
                          no-caps
                          @click="
                            changeEntry(
                              props,
                              props.row['list' + list_look].length
                            )
                          "
                        >
                          next entry
                          <q-badge floating color="purple">
                            {{ props.row.select_entry }}</q-badge
                          >
                        </q-btn>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div v-else>{{ col.value }}</div> -->
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="flex row">
              <FormsView
                :forms="props.row.forms"
                :word="props.row.word"
              ></FormsView>
            </q-card-section>

            <q-separator />
            <q-card-section class="flex row">
              <q-btn
                no-caps
                flat
                color="warning"
                :disable="props.row['list' + props.row.select_list].length > 1"
                >Incorrect</q-btn
              >
              <q-space></q-space>
              <q-btn
                no-caps
                flat
                color="grey"
                size="sm"
                :disable="props.row['list' + props.row.select_list].length > 1"
                >Skip</q-btn
              >
              <q-space></q-space>
              <q-btn
                :disable="props.row['list' + props.row.select_list].length > 1"
                no-caps
                flat
                color="green"
                @click="markCorrect(props)"
                >Correct</q-btn
              >
            </q-card-section>
          </q-card>
          <br />
        </div>
      </template>
    </q-table>
  </q-page>
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

// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

import { supabase } from "src/components/supabase/supabase.js";

export default defineComponent({
  name: "IndexPage2.1",
  components: {
    // MovingWord,
    GraphemesView,
    FormsView,
    POSview,
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
      phonemes,
    };
  },

  data() {
    return {
      syncdb: null,
      products: [],
      words: [],
      notes: [],
      columns: [
        // {
        //   name: "id",
        //   field: "id",
        //   label: "ID",
        //   align: "left",
        // },

        {
          name: "word",
          field: "word",
          label: "word",
          sortable: true,
          align: "left",
        },
        // {
        //   name: "pos",
        //   field: "pos",
        //   label: "pos",
        //   sortable: true,
        //   align: "left",
        // },
        {
          name: "lttrs",
          field: "lttrs",
          label: "list0",
          sortable: true,
          align: "left",
        },

        // {
        //   name: "phonemes",
        //   field: "phonemes",
        //   label: "Phonemes",
        //   sortable: true,
        //   align: "left",
        // },

        {
          name: "actions",
          field: "actions",
          label: "Actions",
          align: "center",
        },
      ],
      rows: [],
      initialPagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 15,
        // rowsNumber: xx if getting data from a server
      },

      select_list: 0,
      ready_lists: [0, 1, 6],
    };
  },
  mounted() {
    // this.$q.dark.set(true);
    this.setup();
  },
  methods: {
    async setup() {
      const { data, error } = await supabase
        .from("words")
        .select(
          `word,
          id,
          sim,
          lists,
          pos (
            id,
            pos,
            sub
          ),
          forms (
            id,
            pidx,
            sidx,
            bidx
          ),
          master1 (approved),
          list0 (
            id,
            pids,
            lids
          ),
          list1 (
            id,
            pids,
            lids
          ),
          list2 (
            id,
            pids,
            lids
          ),
          list3 (
            id,
            pids,
            lids
          ),
          list5 (
            id,
            pids,
            lids
          ),
          list7 (
            id,
            pids,
            lids
          ),
          list8 (
            id,
            pids,
            lids
          ),
          list6(
            id,
            pids,
            lids,
            stress,
            syllables
          )
        `
        )
        // .contains("master1.votes", ["flipdav8@gmail.com"])
        // .eq("master1.id", 1)
        // .not("master1.votes", "cs", `{"flipda@gmail.com"}`) //seems to just filter out from ..
        // .containedBy("master1.votes", ["flipdav8@gmail.com"])
        .not("lists", "is", null)
        .not("lists", "cs", `{"0"}`) //not in list0
        // .filter("lists", "cs", `{"1"}`); // in list1
        .contains("lists", [1, 4, 6])
        // .contains("list6.pids", [1]) // phoneme with list_id 1 exists ..
        // .gt("id", 1740)
        // .gt("id", 708)
        // .range(3, 5)
        .order("word", { ascending: true })
        .limit(100);

      // list1!inner(pids,lids)
      // this.rows = data;
      this.makeRows(data);
      console.log("data", data);
      console.log("error", error);
    },

    makeRows(data) {
      let rows = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index];

        let pref = [0, 6, 3, 5, 2, 1, 7, 8];

        let select_list = this.select_list;
        for (let ww = 0; ww < pref.length; ww++) {
          const pp = pref[ww];
          if (
            element["list" + pp] != undefined &&
            element["list" + pp].length > 0
          ) {
            select_list = pp;
            break;
          }
        }

        rows.push({
          id: element.id,
          word: element.word,
          pos: element.pos,
          forms: element.forms,
          sim: element.sim,
          master1: element.master1,
          lists: element.lists,
          list0: element.list0,
          list1: element.list1,
          list2: element.list2,
          list3: element.list3,
          list5: element.list5,
          list6: element.list6,
          list7: element.list7,
          list8: element.list8,
          select_list: select_list,
          select_entry: 0,
          select_variation: 0,
        });
      }

      this.rows.push(...rows);
    },

    getColor(value) {
      //value from 0 to 1
      var hue = ((1 - value) * 120).toString(10);
      return ["hsl(", hue, ",100%,50%)"].join("");
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

    async markCorrect(props) {
      // supabase.auth.getSession().then(({ data }) => {
      //   // console.log("data", data);
      //   if (data?.session?.access_token) {
      //     logged_in.value = true;
      //   }
      // });

      let session = await supabase.auth.getSession();
      console.log("session", session?.data?.session.user.email);

      let email = session?.data?.session.user.email;
      console.log("props", props);

      let word_id = props.row.id;
      let list = "list" + props.row.select_list;
      let list_id = props.row[list][props.row.select_entry].id;
      let approved = [email];

      let insert_data = {
        word_id: word_id,
        list: list,
        list_id: list_id,
        approved: approved,
      };

      let view =
        this.$refs[word_id + "-" + list + "-" + props.row.select_entry];

      if (view[0] === undefined) {
        return;
      }

      // console.log("view", view[0]);
      // console.log(
      //   "current letters",
      //   view[0].ordered_letters[view[0].variation_index]
      // );

      let given_pids = view[0].pids;
      let current_pids = view[0].use_pids;

      if (given_pids.toString() !== current_pids.toString()) {
        console.log("pids changed");
        console.log("from", given_pids);
        console.log("to", current_pids);
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
        this.trackMods({
          data: insert_data,
          type: "letters",
          lids: current_letters,
        });
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

      return;

      let check = await this.checkExists(insert_data);

      console.log("check", check);

      if (check.length > 0) {
        let update_data = insert_data;
        update_data["id"] = check[0].id;
        update_data["approved"] = [
          ...insert_data.approved,
          ...check[0].approved,
        ];
        const { data, error } = await supabase
          .from("master1")
          .upsert(update_data);
        console.log("update error", error);
        console.log("update data", data);
      } else {
        const { data, error } = await supabase
          .from("master1")
          .insert(insert_data);

        console.log("error", error);
        console.log("data", data);
      }
    },

    async trackMods(payload) {
      // setup table to insert..
    },

    async checkExists(insert_data) {
      const { data, error } = await supabase
        .from("master1")
        .select()
        .eq("word_id", insert_data.word_id)
        .eq("list", insert_data.list)
        .eq("list_id", insert_data.list_id);

      return data;
    },
  },
});
</script>
