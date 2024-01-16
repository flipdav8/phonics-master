<template>
  <div class="fit q-pa-md">
    <div class="text-caption q-pa-sm">
      Used with words (within letters) in each unit
    </div>

    <!-- <q-btn @click="getTesting()" no-caps>Testing</q-btn> -->
    <!-- NEW BLOCK -->
    <q-card
      v-if="add_block && !operation"
      flat
      class="fit flex flex-center column"
    >
      <q-card-section class="fit">
        <q-list>
          <q-item>
            <q-item-section>
              <q-btn no-caps outline size="lg" disable> Region: AU </q-btn>
            </q-item-section>

            <q-item-section>
              <q-select
                label="type"
                outlined
                v-model="new_block.type"
                :options="block_types"
              ></q-select>
            </q-item-section>

            <q-item-section>
              <q-input
                label="label"
                outlined
                v-model="new_block.label"
              ></q-input>
            </q-item-section>
            <q-item-section
              @click="addOptionIcon(new_block)"
              avatar
              class="cursor-pointer"
            >
              <div v-if="new_block.icon == undefined">No Icon..</div>
              <q-icon v-else-if="new_block.icon.src !== undefined" size="xl">
                <img :src="new_block.icon.src" type="image/svg+xml" />
              </q-icon>
              <q-icon
                v-else-if="new_block.icon.includes('mdi')"
                :name="new_block.icon"
                size="xl"
              ></q-icon>
              <div v-else>No Icon</div>
            </q-item-section>
          </q-item>

          <!-- {{ new_block }} -->

          <q-item-label header>
            {{ new_block.options.length }} Options
            <q-btn
              no-caps
              color="green"
              flat
              icon="mdi-plus"
              @click="setNewOption()"
              >Add Option</q-btn
            ></q-item-label
          >
          <q-item v-for="(option, idx) in new_block.options" :key="idx">
            <q-item-section avatar>
              <q-input label="label" v-model="option.label" outlined></q-input>
            </q-item-section>

            <q-item-section
              v-if="new_block.type === 'spelling'"
              @click="addOptionIcon(option)"
              avatar
              class="cursor-pointer"
            >
              <div v-if="option.icon == undefined">No Icon..</div>
              <div v-else-if="option.icon == null">No Icon..</div>

              <q-icon v-else-if="option.icon.src !== undefined" size="xl">
                <img :src="option.icon.src" type="image/svg+xml" />
              </q-icon>
              <q-icon
                v-else-if="option.icon.includes('mdi')"
                :name="option.icon"
                size="xl"
              ></q-icon>
              <q-btn v-else icon-right="mdi-plus" no-caps flat>Icon</q-btn>
              <!-- <q-input label="icon" v-model="option.icon" outlined></q-input> -->
            </q-item-section>
            <q-item-section avatar>
              <div>
                <q-btn
                  :icon="
                    option.sound === null ? 'mdi-speaker-off' : 'mdi-speaker'
                  "
                  :color="option.sound !== null ? 'green' : 'warning'"
                  @click="addOptionSound(option)"
                  flat
                >
                </q-btn>
              </div>
            </q-item-section>

            <q-btn
              icon="mdi-close"
              flat
              @click="removeOption(idx)"
              color="red"
            ></q-btn>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section class="self-end q-gutter-x-sm">
        <q-btn no-caps @click="cancelNew()">Cancel</q-btn>
        <q-btn color="green" no-caps @click="addBlock()">
          {{ edit_id === null ? "Add New Block" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>
    <div v-if="operation">
      <q-linear-progress query color="secondary" class="q-my-sm" rounded />
    </div>

    <!-- NEW OPTION -->
    <q-dialog v-model="add_option" v-if="new_option !== null">
      <q-card flat class="flex flex-center column">
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>Option:</q-item-section>
              <q-item-section>
                <q-input outlined v-model="new_option.label"></q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section class="self-end">
          <q-btn color="green" no-caps @click="addNewOption()">
            Add New Option
          </q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="show_icons" full-height full-width>
      <IconList
        v-model:model_icon="edit_option.icon"
        :icons="icons"
        @close="show_icons = false"
      ></IconList>
    </q-dialog>

    <q-dialog v-model="show_sounds" full-height full-width>
      <SoundList
        v-model:model_sound="edit_option.sound"
        :sounds="sounds"
        @close="show_sounds = false"
      ></SoundList>
    </q-dialog>

    <q-table
      :columns="columns"
      :rows="block_rows"
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
        <q-btn @click="addNew()" no-caps color="green"> Add Block </q-btn>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="mdi-pencil-outline"
            flat
            @click="editBlock(props.row.block, props.row.id)"
          ></q-btn>

          <q-btn
            icon="mdi-close"
            flat
            @click="deleteBlock(props.row.id)"
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

export default defineComponent({
  name: "BlocksPage",
  components: {
    IconList,
    SoundList,
  },
  props: {
    block_rows: {},
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
      units: [],
      edit_id: null,
      new_block: null,
      exclude: [],
      new_option: null,
      add_block: false,
      add_option: false,
      edit_block: null,
      // block_rows: [],
      columns: [
        // {
        //   name: "id",
        //   field: "id",
        //   label: "ID",
        //   align: "left",
        // },
        {
          name: "label",
          field: "label",
          label: "Label",
          align: "left",
          sortable: true,
        },
        {
          name: "type",
          field: "type",
          label: "Type",
          align: "center",
        },
        {
          name: "options",
          field: "options",
          label: "Options",
          align: "center",
        },
        {
          name: "actions",
          field: "actions",
          label: "Actions",
          align: "center",
        },
      ],
      filter: "",
      block_types: ["spelling", "sound"],
      block_template: {
        id: 0,
        label: "",
        type: "sound",
        icon: "",
        options: [
          // { label: "ay", sound: null, icon: "" },
          // { label: "a-e", sound: null, icon: "" },
          // { label: "ai", sound: null, icon: "" },
          // { label: "a", sound: null, icon: "" },
          // { label: "ea", sound: null, icon: "" },
        ], // TODO: shuffle order..
        // longest: "a-e",
      },
      option_template: { label: "ay", sound: null, icon: "" },
      phonic_options: [
        {
          id: 2,
          label: "ow",
          sound: "ow",
          type: "sound",
          options: [
            { label: "cloud", sound: null },
            { label: "boat", sound: null },
          ],
          longest: "cloud",
        },
      ],

      show_icons: false,
      show_sounds: false,
      edit_option: null,
      operation: false,
    };
  },
  mounted() {
    // this.addNew();
  },

  methods: {
    addNew() {
      if (this.add_block) {
        this.cancelNew();
      } else {
        this.add_block = true;
        this.new_block = JSON.parse(JSON.stringify(this.block_template));
      }
    },

    cancelNew() {
      this.add_block = false;
      this.edit_id = null;
      this.new_block = null;
    },

    setNewOption() {
      this.add_option = true;
      let new_option = JSON.parse(JSON.stringify(this.option_template));
      // new_option.id = this.new_block.options.length + 1;
      this.new_option = new_option;
      // this.new_unit.words.push(new_word);
    },

    addNewOption() {
      this.new_block.options.push(this.new_option);
      this.new_option = null;
    },

    addOptionIcon(option) {
      this.show_icons = true;
      this.edit_option = option;
    },

    addOptionSound(option) {
      this.show_sounds = true;
      this.edit_option = option;
    },

    removeOption(index) {
      this.new_block.options.splice(index, 1);
    },

    editBlock(block, item_id) {
      console.log("block", block);
      this.edit_id = item_id;
      this.new_block = block;
      this.add_block = true;
    },

    ///USE API

    async getTesting() {
      // console.log("invites", this.accounts.invites);
      // this.accounts.invites[2].accept();
      // return;

      // let id = "blc0OpFm9HQCL_Y9PS9pTvEEHQKlic";
      // let id = "blc0OpFlBajsliHSlypxcH_t|ftcom";
      let id = "rlm0OoxvvxBpIrr70RtMa2KfnGBcom"; // realmd id from member
      // let id ="mmb-owner-rlm0OoxvvxBpIrr70RtMa2KfnGBcom" // member id for above

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let token = await this.getGlobalToken();
      let member_item = {
        // realmId: "rlm-public",
        realmId: "rlm-public",
        email: "flipdav8@gmail.com",
        name: "flipdav8@gmail.com",
        invite: true,
        roles: [],
        permission: {
          add: ["blocks"],
          update: ["*"],
          manage: ["*"],
        },
      }; // not working when accepted

      await axios
        // .get(`${base_url}/all/blocks/${id}`, {
        // .delete(`${base_url}/all/blocks/${id}`, {
        // .get(`${base_url}/all/members`, {
        // .get(`${base_url}/all/realms/${id}`, {
        .get(`${base_url}/all/blocks`, {
          // .post(`${base_url}/all/members`, member_item, {
          // .get(`${base_url}/all/members`, {
          // .get(`${base_url}/all/realms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("TESTING ", response);
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    }, //testing

    async addBlockLOCAL() {
      let realmId = "rlm-public";

      let item = {
        region: "AU",
        block: this.new_block,
        owner: this.accounts.currentUser.email,
        realmId: realmId,
      };

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;
        //
      }

      try {
        let test = await syncdb.blocks.add(item);
        console.log("test", test);
        this.cancelNew();
        // this.$emit("refresh");
      } catch (error) {
        let status = `Failed to add blocks: ${error}`;
        console.log("status error", status);
      }
    }, //not working.. not sure how to add email to public realm..

    async addBlock() {
      this.operation = true;
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      // let token = this.accounts.currentUser.accessToken;
      let token = await this.getGlobalToken();

      this.new_block.id = this.blocks.length + 1;

      let item = {
        region: "AU",
        block: this.new_block,
        // realmId: realmId,
      };

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;
        // item.id = "blc0OoCxU1glNW42jEMrfypC4bqlic";
        let deleted = await this.deleteBlock(item.id);
        if (!deleted) {
          return;
        }
      }

      await axios
        .post(`${base_url}/public/blocks`, item, {
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
      // this.getBlocksAPI();
      // this.$emit("refresh");
      this.operation = false;
      return;

      try {
        let b = await syncdb.blocks.put(JSON.parse(JSON.stringify(item)));
        console.log("new block", b);
        this.new_block = null;
        this.add_block = false;
      } catch (error) {
        console.log(`Failed to add block: ${error}`);
      }
    }, //api version

    async deleteBlock(id) {
      if (this.edit_id === null) {
        var result = confirm("Are you sure you want to delete this course?");
      } else {
        var result = true;
      }

      if (result) {
        this.operation = true;
        let dbid = process.env.DBID;
        let base_url = `https://${dbid}.dexie.cloud`;
        let token = await this.getGlobalToken();

        let deleted = false;
        await axios
          .delete(`${base_url}/public/blocks/${id}`, {
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
          this.$emit("removeBlock", id);
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
          grant_type: "client_credentials",
          scopes: [
            "ACCESS_DB",
            // "IMPERSONATE",
            // "MANAGE_DB",
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
