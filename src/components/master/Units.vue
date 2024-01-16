<template>
  <div class="fit q-pa-md">
    <!-- NEW UNIT -->
    <q-card
      v-if="add_unit && !operation"
      flat
      class="fit flex flex-center column"
    >
      <q-card-section class="fit">
        <q-list>
          <q-item>
            <q-item-section avatar>Label:</q-item-section>
            <q-item-section>
              <q-input outlined v-model="new_unit.label"></q-input>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>Info:</q-item-section>
            <q-item-section>
              <q-input
                outlined
                v-model="new_unit.text"
                type="textarea"
                autogrow
              ></q-input>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-select
                label="Default Type"
                v-model="new_unit.type"
                outlined
                :options="word_types"
              ></q-select>
            </q-item-section>

            <q-item-section>
              <q-btn
                @click="addOptionBlock(new_unit)"
                no-caps
                outline
                size="lg"
              >
                <span v-if="new_unit.block == null">Add Default Block</span>
                <span v-else>Default Block: {{ new_unit.block.label }} </span>
              </q-btn>
            </q-item-section>
          </q-item>

          <!-- Prefilled Type.. ee + icon is bee sound.. -->

          <q-item-label header>
            <q-btn
              no-caps
              color="green"
              outline
              icon="mdi-plus"
              @click="add_word = true"
              class="q-mr-md"
              >Add Word/s</q-btn
            >
            {{ new_unit.words.length }} Words
          </q-item-label>
          <div class="flex row q-mx-sm q-gutter-sm">
            <div
              v-for="(word, idx) in new_unit.words"
              :key="idx"
              class="flex row"
              style="border: solid 1px; border-radius: 10px"
            >
              <div avatar>
                <q-chip>{{ word.word }}</q-chip>
              </div>

              <div avatar>
                <q-btn
                  @click="removeWord(idx)"
                  icon="mdi-close"
                  color="red"
                  flat
                  rounded
                ></q-btn>
              </div>
            </div>
          </div>
        </q-list>
      </q-card-section>
      <q-card-section class="self-end q-gutter-x-sm">
        <q-btn no-caps @click="cancelNew()">Cancel</q-btn>

        <!-- :disable="new_unit.words.length < 1" -->
        <q-btn color="green" no-caps @click="addUnit()">
          {{ edit_id === null ? "Add New Unit" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>
    <div v-if="operation">
      <q-linear-progress query color="secondary" class="q-my-sm" rounded />
    </div>

    <!-- NEW WORD -->
    <q-dialog v-model="add_word" full-height full-width>
      <WordList
        :words="words.map((e) => ({ ...e.word, id: e.id }))"
        @close="add_word = false"
        @select="addWord"
        @selectWords="addWords"
        :filter_type="new_unit.type"
        :filter_block="new_unit.block"
        :selected_words="new_unit.words"
      >
      </WordList>
    </q-dialog>

    <q-dialog v-model="show_blocks" full-height full-width>
      <BlockList
        v-model:model_block="edit_option.block"
        :blocks="blocks.map((e) => ({ ...e.block, id: e.id }))"
        @close="show_blocks = false"
        :filter_type="new_unit.type"
      >
      </BlockList>
    </q-dialog>

    <q-table
      :columns="columns"
      :rows="unit_rows"
      :filter="filter"
      bordered
      separator="cell"
      row-key="name"
    >
      <template v-slot:top>
        <q-input dense outlined color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />
        <q-btn @click="addNew()" no-caps color="green"> Add Unit </q-btn>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="mdi-pencil-outline"
            flat
            @click="editUnit(props.row.unit, props.row.id)"
          ></q-btn>

          <q-btn
            icon="mdi-close"
            flat
            @click="deleteUnit(props.row.id, props.row.words)"
            color="red"
          ></q-btn>
          <!-- <div v-if="view_as === props.row.id">Active</div> -->
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent } from "vue";
// import DexieLogin from "src/components/dexie/DexieLogin.vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

// import Classroom from "src/components/classrooms/Classroom.vue";
import axios from "axios";

import BlockList from "src/components/master/BlockList.vue";
import WordList from "src/components/master/WordList.vue";

export default defineComponent({
  name: "UnitsPage",
  components: {
    BlockList,
    WordList,
  },
  props: {
    unit_rows: {},
    words: {},
    blocks: {},
    icons: {},
    sounds: {},
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
    };
  },
  data() {
    return {
      edit_id: null,
      // blocks: [],
      units: [],
      new_unit: null,
      new_word: null,
      add_unit: false,
      add_word: false,
      edit_unit: null,
      // unit_rows: [],
      columns: [
        // {
        //   field: "id",
        //   label: "ID",
        //   align: "left",
        // },
        {
          field: "label",
          label: "Label",
          align: "left",
        },

        {
          field: "word_count",
          label: "Words",
          align: "left",
        },

        {
          name: "actions",
          field: "actions",
          label: "Actions",
          align: "center",
        },
      ],
      filter: "",

      prefill_block: null,
      prefill_type: "sound",

      unit_template: {
        id: 0,
        label: "Unit 1",
        type: "sound",
        block: null,
        info: "text..",
        words: [],
        word_ids: [],

        // order: 1,
        // revision_rule: "default",
      },

      edit_word: false,
      word_types: ["sound", "spelling"],

      edit_option: null,
      show_blocks: null,

      operation: false,
    };
  },
  mounted() {
    // this.testAPI(); //testing public_test
    // this.addNew();
  },

  methods: {
    async testAPI() {
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      let token = await this.getGlobalToken();

      let item = {
        test: "testing ",
      };

      await axios
        .post(`${base_url}/public/public_test`, item, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("response", response);
          //
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });

      this.cancelNew();
    },

    addNew() {
      if (this.add_unit) {
        this.cancelNew();
      } else {
        this.add_unit = true;
        this.new_unit = JSON.parse(
          JSON.stringify({
            ...this.unit_template,
            ...{ block: this.prefill_block, type: this.prefill_type },
          })
        );
      }
    },

    cancelNew() {
      this.add_unit = false;
      this.edit_id = null;
      this.new_unit = null;
      this.edit_word = false;
    },

    addWord(word) {
      // this.new_unit.word_list.push(word);
      // this.add_word = false;
      this.new_unit.words.push(word);
      this.new_unit.word_ids.push(word.id);
      this.add_word = false;
    }, //latest verion

    addWords(words) {
      // this.new_unit.word_list.push(word);
      // this.add_word = false;
      this.new_unit.words.push(...words);
      this.new_unit.word_ids.push(...words.map((e) => e.id));
      this.add_word = false;
    },

    editWord(word) {
      this.new_word = word;
      this.edit_word = true;
      this.add_word = true;
    },
    removeWord(idx) {
      this.new_unit.words.splice(idx, 1);
      this.new_unit.word_ids.splice(idx, 1);
    },

    editUnit(unit, item_id) {
      // console.log("item_id", item_id);
      // console.log("unit", unit);
      this.edit_id = item_id;
      this.new_unit = unit;
      this.add_unit = true;
    },

    addOptionBlock(option) {
      this.show_blocks = true;
      this.edit_option = option;
    },

    async addUnit() {
      this.operation = true;
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      // let token = this.accounts.currentUser.accessToken;
      let token = await this.getGlobalToken();

      // this.new_unit.id = this.units.length + 1;

      let item = {
        region: "AU",
        course_ids: [],
        unit: this.new_unit,
        // realmId: realmId,
      };

      this.prefill_block = this.new_unit.block;
      this.prefill_type = this.new_unit.type;

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;
        let deleted = await this.deleteUnit(item.id);
        if (!deleted) {
          return;
        }
      }

      let vm = this;
      await axios
        .post(`${base_url}/public/units`, item, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("response", response);

          vm.updateWords(item.unit.words, response.data[0]);
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });

      this.cancelNew();
      this.$emit("refresh");
      this.operation = false;
    },

    async updateWords(words, unit_id, remove) {
      let word_ids = words.map((e) => e.id);
      for (let idx = 0; idx < word_ids.length; idx++) {
        const word_id = word_ids[idx];
        const word = this.words.find((e) => e.id === word_id);
        await this.updateWord(word, unit_id, remove);
      }
    },
    async updateWord(word, unit_id, remove) {
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      let token = await this.getGlobalToken();

      // word.unit_ids; /change..
      let unit_ids = word.unit_ids;
      if (unit_ids == undefined) {
        word["unit_ids"] = [unit_id];
      } else {
        if (remove !== undefined) {
          if (unit_ids.includes(unit_id)) {
            let r = word.unit_ids.findIndex((e) => e === unit_id);
            word.unit_ids.splice(r, 1);
          }
        } else if (!unit_ids.includes(unit_id)) {
          word.unit_ids.push(unit_id);
        } else {
          return;
        }
      }

      await this.deleteWord(word.id);

      await axios
        .post(`${base_url}/public/words`, word, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("word updated", response);
          //
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async deleteWord(word_id) {
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      let token = await this.getGlobalToken();

      await axios
        .delete(`${base_url}/public/words/${word_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("deleted ", response);
        })
        .catch(function (error) {
          console.log("error", error);
        });
    },

    async deleteUnit(id, words) {
      if (this.edit_id === null) {
        var result = confirm("Are you sure you want to delete this uniit?");
      } else {
        var result = true;
      }
      if (result) {
        this.operation = true;
        if (this.edit_id === null && words !== undefined) {
          this.updateWords(words, id, "remove");
        }

        let dbid = process.env.DBID;
        let base_url = `https://${dbid}.dexie.cloud`;
        let token = await this.getGlobalToken();

        let deleted = false;
        await axios
          .delete(`${base_url}/public/units/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(function (response) {
            console.log("deleted ", response);
            deleted = true;
          })
          .catch(function (error) {
            console.log("error", error);
            // return undefined;
            deleted = false;
          });

        if (deleted) {
          this.$emit("removeUnit", id);
        }
        this.operation = false;
        return deleted;
      }
    },
    async getGlobalToken() {
      let base_url = "https://z5w9xqwfd.dexie.cloud";
      // console.log("this.account", this.accounts.currentUser);
      // let token = this.accounts.currentUser.accessToken;
      let client_id = process.env.clientId;
      let client_secret = process.env.clientSecret;

      let token = null;
      await axios
        .post(`${base_url}/token`, {
          // params: {
          grant_type: "client_credentials",
          scopes: [
            "ACCESS_DB",
            "IMPERSONATE",
            "MANAGE_DB",
            "GLOBAL_READ",
            "GLOBAL_WRITE",
            // "DELETE_DB",
          ],
          client_id: client_id,
          client_secret: client_secret,
          // claims: {
          //   sub: "flipdav8@gmail.com",
          //   email: "flipdav8@gmail.com",
          //   name: "flipdav8@gmail.com",
          // },
          // },
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          // console.log("response", response);
          token = response.data.accessToken;
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
      return token;
    },
  },
});
</script>
<style>
.my-pill {
  border: solid 1px;
  border-radius: 10px;
}
</style>
