<template>
  <div class="fit q-pa-md">
    <div class="flex row q-pa-sm justify-start items-center">
      <div class="text-h5">Units</div>
      <q-btn no-caps flat @click="addNew()" icon="mdi-plus"></q-btn>
    </div>
    <!-- NEW UNIT -->
    <q-card v-if="add_unit" flat class="fit flex flex-center column">
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

          Prefilled Type.. ee + icon is bee sound..

          <q-item-label header>
            {{ new_unit.words.length }} Words
            <q-btn
              no-caps
              color="green"
              flat
              icon="mdi-plus"
              @click="setNewWord()"
              >Add Word</q-btn
            ></q-item-label
          >
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
                  @click="editWord(word)"
                  icon="mdi-pencil-outline"
                  flat
                ></q-btn>
              </div>

              <div avatar>
                <q-btn
                  @click="removeWord(idx)"
                  icon="mdi-close"
                  color="red"
                  flat
                ></q-btn>
              </div>
            </div>
          </div>
        </q-list>
      </q-card-section>
      <q-card-section class="self-end q-gutter-x-sm">
        <q-btn no-caps @click="cancelNew()">Cancel</q-btn>

        <q-btn
          color="green"
          no-caps
          :disable="new_unit.words.length < 1"
          @click="addUnit()"
        >
          {{ edit_id === null ? "Add New Unit" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>
    <!-- NEW WORD -->

    <q-dialog v-model="add_word" v-if="new_word !== null">
      <q-card flat class="flex flex-center column">
        <q-card-section>
          <q-list>
            <!-- word, correct, icon -->
            <q-item>
              <q-item-section>
                <q-select
                  label="type"
                  outlined
                  v-model="new_word.type"
                  :options="word_types"
                ></q-select>
              </q-item-section>
              <q-item-section>
                <q-input
                  label="word"
                  outlined
                  v-model="new_word.word"
                ></q-input>
              </q-item-section>

              <q-item-section>
                <q-btn
                  flat
                  @click="addHomoIcon(new_word)"
                  class="cursor-pointer"
                  no-caps
                >
                  <span> Homophone</span>
                  <q-icon
                    v-if="
                      new_word.homo != null && new_word.homo.src !== undefined
                    "
                    size="xl"
                  >
                    <img :src="new_word.homo.src" type="image/svg+xml" />
                  </q-icon>
                  <q-icon
                    v-else-if="
                      new_word.homo != null && new_word.homo.includes('mdi')
                    "
                    :name="new_word.homo"
                    size="md"
                  ></q-icon>
                  <q-icon v-else name="mdi-plus" size="md"></q-icon>
                </q-btn>
              </q-item-section>
            </q-item>

            <div class="q-ma-md">
              <div class="flex column q-mx-sm q-gutter-sm items-center">
                <span class="flex row">
                  <span class="q-mr-sm">Pattern:</span>
                  <span v-for="(s, idx) in new_word.pattern" :key="idx">
                    <strong v-if="s.input">{{ s.letters }}</strong>
                    <span v-else> {{ s.letters }}</span> -</span
                  >
                </span>

                <div
                  v-for="(s, idx) in new_word.pattern"
                  :key="idx"
                  class="flex row items-center my-pill fit justify-between q-px-sm q-mt-md"
                >
                  <!-- :class="{ 'bg-warning': s.input && s.block == null }" -->

                  <!-- LETTERS -->
                  <div class="col-2">
                    <q-input
                      label="letters"
                      v-model="s.letters"
                      flat
                      dense
                      outlined
                      class="q-my-sm col-4"
                    ></q-input>
                  </div>

                  <!-- INPUT -->
                  <div class="flex row items-center">
                    <span class="text-caption">Input</span>
                    <q-toggle v-model="s.input"></q-toggle>
                  </div>

                  <!-- ICON + SOUND -->
                  <div>
                    <q-btn v-if="s.input" flat @click="addOptionIcon(s)">
                      <q-icon v-if="s.icon.src !== undefined" size="xl">
                        <img :src="s.icon.src" type="image/svg+xml" />
                      </q-icon>
                      <q-icon
                        v-else-if="s.icon.includes('mdi')"
                        :name="s.icon"
                        size="md"
                      ></q-icon>
                      <q-btn
                        v-else
                        icon-right="mdi-plus"
                        size="md"
                        no-caps
                        flat
                      >
                        Icon
                      </q-btn>
                    </q-btn>

                    <q-btn
                      :icon="
                        s.sound === null ? 'mdi-speaker-off' : 'mdi-speaker'
                      "
                      :color="s.sound !== null ? 'green' : 'warning'"
                      @click="addOptionSound(s)"
                      flat
                    >
                    </q-btn>
                  </div>

                  <q-btn
                    icon="mdi-pencil-plus-outline"
                    flat
                    @click="editWordPattern(idx)"
                  ></q-btn>

                  <!-- DELETE -->
                  <q-btn
                    icon="mdi-delete-outline"
                    color="red"
                    flat
                    @click="removePattern(idx)"
                  ></q-btn>

                  <div
                    v-if="edit_pattern == idx"
                    class="col-12 q-my-sm flex row justify-around items-center"
                  >
                    <!-- BLOCK -->
                    <div v-if="s.input" class="flex row items-center">
                      <span class="text-caption" v-show="s.block !== null"
                        >Block</span
                      >
                      <q-btn flat @click="addOptionBlock(s)" no-caps>
                        <span v-if="s.block == null">Add Block</span>
                        <span v-else>{{ s.block.label }}</span>
                      </q-btn>
                    </div>
                  </div>

                  <div
                    v-if="edit_pattern == idx && s.input && s.block !== null"
                    class="col-12 q-my-sm flex row justify-around items-center"
                  >
                    <!-- CORRECT -->
                    <div v-if="s.input && s.block !== null" class="col-5">
                      <q-select
                        label="correct"
                        v-model="s.correct"
                        flat
                        dense
                        outlined
                        :options="
                          s.block == null
                            ? []
                            : blocks.find((e) => e.id === s.block.id).block
                                .options
                        "
                        :option-value="(e) => e.label"
                        emit-value
                      >
                        <template v-slot:option="{ itemProps, opt }">
                          <q-item v-bind="itemProps">
                            <q-item-section>
                              <q-item-label>
                                {{ opt.label }}
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              {{ opt.icon }}
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <!-- EXCLUDE -->
                    <div v-if="s.input && s.block !== null" class="col-5">
                      <q-select
                        label="Exclude"
                        v-model="s.exclude"
                        multiple
                        flat
                        dense
                        outlined
                        :options="
                          s.block == null
                            ? []
                            : blocks.find((e) => e.id === s.block.id).block
                                .options
                        "
                        :option-value="(e) => e.label"
                        emit-value
                        clearable
                        @clear="s.exclude = []"
                      >
                        <template v-slot:option="{ itemProps, opt }">
                          <q-item v-bind="itemProps">
                            <q-item-section>
                              <q-item-label>
                                {{ opt.label }}
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              {{ opt.icon }}
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  icon="mdi-plus"
                  size="md"
                  @click="addPattern()"
                ></q-btn>
              </div>
            </div>
          </q-list>
        </q-card-section>
        <q-card-section v-if="!edit_word" class="self-end">
          <!-- :disable="new_word.phonic_option_id === null" -->
          <q-btn color="green" no-caps @click="addNewWord()">
            Add New Word
          </q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="show_icons">
      <IconList
        v-if="edit_option === null"
        v-model:model_icon="new_word.homo"
        :icons="icons"
        @close="show_icons = false"
      ></IconList>

      <IconList
        v-else
        v-model:model_icon="edit_option.icon"
        :icons="icons"
        @close="show_icons = false"
      ></IconList>
    </q-dialog>

    <q-dialog v-model="show_sounds">
      <SoundList
        v-model:model_sound="edit_option.sound"
        :sounds="sounds"
        @close="show_sounds = false"
      ></SoundList>
    </q-dialog>

    <q-dialog v-model="show_blocks">
      <BlockList
        v-model:model_block="edit_option.block"
        :blocks="blocks.map((e) => ({ ...e.block, id: e.id }))"
        @close="show_blocks = false"
      >
      </BlockList>
    </q-dialog>

    <q-table :columns="columns" :rows="unit_rows">
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
            @click="deleteUnit(props.row.id)"
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

import IconList from "src/components/master/IconList.vue";
import SoundList from "src/components/master/SoundList.vue";
import BlockList from "src/components/master/BlockList.vue";

export default defineComponent({
  name: "UnitsPage",
  components: {
    IconList,
    SoundList,
    BlockList,
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
        {
          field: "id",
          label: "ID",
          align: "left",
        },
        {
          field: "label",
          label: "Label",
          align: "left",
        },

        {
          field: "words",
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
      unit_template: {
        id: 0,
        label: "Unit 1",
        // unit_type: "original",
        info: "text..",
        words: [],
        word_ids: [],
        // order: 1,
        // revision_rule: "default",
      },
      edit_pattern: null, //id for edit pattern
      pattern_template: {
        letters: "...",
        input: false,
        icon: "",
        sound: null,
        block: null,
        exclude: [],
        correct: "", // for spelling type..
      },
      edit_word: false,
      word_types: ["sound", "spelling"],
      word_template: {
        id: 0,
        word: "",
        icon: "",
        phonic_option_id: null, // ay, etc..
        correct: "",
        type: "sound",
        pattern: [
          // {
          //   letters: "ai",
          //   input: true,
          //   icon: "mdi-snail",
          //   sound: null,
          //   block: null,
          //   exclude: [],
          //   correct: "",
          // },
          // {
          //   letters: "d",
          //   input: false,
          //   icon: "mdi-dog-side",
          //   sound: null,
          //   block: null,
          //   exclude: [],
          //   correct: "",
          // },
        ],
        homo: null,
      },

      edit_option: null,
      show_icons: false,
      show_sounds: false,
      show_blocks: null,
    };
  },
  mounted() {
    // this.getBlocks();
    // this.getBlocksAPI();
    // this.getUnits();
    // this.getUnitsAPI();
    // this.testAPI(); //testing public_test
    // this.addNew();
    // this.setNewWord();
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
    async getUnits() {
      try {
        useObservable(
          from(
            liveQuery(async () => {
              this.units = await syncdb.units.toArray();
              this.makeRows();
            })
          )
        );
      } catch (error) {
        let status = `Failed to read units: ${error}`;
        console.log("status error", status);
      }
    },

    addNew() {
      if (this.add_unit) {
        this.cancelNew();
      } else {
        this.add_unit = true;
        this.new_unit = JSON.parse(JSON.stringify(this.unit_template));
      }
    },

    cancelNew() {
      this.add_unit = false;
      this.edit_id = null;
      this.new_unit = null;
      this.edit_pattern = null;
      this.edit_icon = null;
      this.edit_word = false;
    },

    editWord(word) {
      this.new_word = word;
      this.edit_word = true;
      this.add_word = true;
    },
    removeWord(idx) {
      this.new_unit.words.splice(idx, 1);
    },

    setNewWord() {
      this.edit_word = false;
      this.add_word = true;
      let new_word = JSON.parse(JSON.stringify(this.word_template));
      new_word.id = this.new_unit.words.length + 1;
      this.new_word = new_word;
      // this.new_unit.words.push(new_word);
      this.edit_pattern = null;
      this.edit_icon = null;
    },
    editWordPattern(idx) {
      if (this.edit_pattern === idx) {
        this.edit_pattern = null;
      } else {
        this.edit_pattern = idx;
      }
    },
    removePattern(idx) {
      this.new_word.pattern.splice(idx, 1);
    },
    addPattern() {
      this.new_word.pattern.push(
        JSON.parse(JSON.stringify(this.pattern_template))
      );
    },

    addNewWord() {
      this.new_unit.words.push(this.new_word);
      this.new_word = null;
    },
    editUnit(unit, item_id) {
      // console.log("item_id", item_id);
      // console.log("unit", unit);
      this.edit_id = item_id;
      this.new_unit = unit;
      this.add_unit = true;
    },

    addHomoIcon(new_word) {
      this.show_icons = true;
      this.edit_option = null;
    },
    addOptionIcon(option) {
      this.show_icons = true;
      this.edit_option = option;
    },

    addOptionSound(option) {
      this.show_sounds = true;
      this.edit_option = option;
    },

    addOptionBlock(option) {
      this.show_blocks = true;
      this.edit_option = option;
    },

    async addUnit() {
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      // let token = this.accounts.currentUser.accessToken;
      let token = await this.getGlobalToken();

      // this.new_unit.id = this.units.length + 1;

      let item = {
        region: "AU",
        unit: this.new_unit,
        // realmId: realmId,
      };

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;
        let deleted = await this.deleteUnit(item.id);
        if (!deleted) {
          return;
        }
      }

      await axios
        .post(`${base_url}/public/units`, item, {
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
      // this.getUnitsAPI();
      this.$emit("refresh");
    },
    async deleteUnit(id) {
      if (this.edit_id === null) {
        var result = confirm("Are you sure you want to delete this uniit?");
      } else {
        var result = true;
      }
      if (result) {
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
          this.$emit("deleteUnit", id);
        }
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

    async addMember() {
      //
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
