<template>
  <q-page class="flex flex-center column" dark>
    <!-- <q-btn @click="test()">Test</q-btn> -->
    <!-- <div>hello {{ products[1] }}</div> -->
    <q-table
      class="fit"
      :rows="rows"
      :columns="columns"
      :pagination="initialPagination"
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
            <div v-else>{{ col.value }}</div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" :key="props.row.id">
          <q-td colspan="100%">
            <div>
              <MovingWord
                :word="props.row.word"
                :phonemes="props.row.phonemes"
                :letters="props.row.lttrs[0]"
              ></MovingWord>
              <br />

              <div>
                {{ props.row.notes }}
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";

import { setupSync, syncdb } from "src/database/dbCloud.master";

import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
// import { syncdb, setupSync  } from "src/database/dbCloud.master";
// import { syncdb, setupSync  } from "src/database/dbCloud.master";
// import { setupSync } from "src/database/dbCloud";

import axios from "axios";

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

let mydb = null;

import CryptoJS from "crypto-js";

import MovingWord from "/src/components/animations/MovingWord.vue";

export default defineComponent({
  name: "IndexPage2.0",
  components: {
    MovingWord,
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
        {
          name: "pos",
          field: "pos",
          label: "pos",
          sortable: true,
          align: "left",
        },
        {
          name: "lttrs",
          field: "lttrs",
          label: "letters",
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
    };
  },
  mounted() {
    this.setup();
  },
  methods: {
    async setup() {
      await setupSync();
      // this.syncdb.cloud.login();
      // this.currentUser = useObservable(this.syncdb.cloud.currentUser);
      // this.userPrompts = useObservable(this.syncdb.cloud.userInteraction);
      // console.log("subscription", this.accountStore.subscription);

      this.getTest();
    },

    async getTest() {
      try {
        this.notes = await syncdb.notes.toArray();
        // console.log("notes", this.notes);
        this.words = await syncdb.words.toArray();
        // console.log(mydb);
        this.createRows();
        // this.products = await syncdb.products.toArray();
      } catch (error) {
        let status = `Failed to read ...: ${error}`;
        console.log("status error", status);
      }
    },

    createRows() {
      for (let index = 0; index < this.words.length; index++) {
        const element = this.words[index];

        this.rows.push({
          id: element.id,
          word: element.word,
          pos: element.pos,
          lttrs: this.decrypt(element.lttrs),
          phonemes: element.pids.map((f) =>
            phonemes.find((e) => e.list_id === f)
          ),
          notes: this.notes.filter((e) => e.word_id === element.id),
        });
      }
    },

    async getNotes(word_id) {
      try {
        return await syncdb.notes.where("word_id").equals(word_id).toArray();
      } catch (error) {
        let status = `Failed to read units: ${error}`;
        console.log("status error", status);
        return null;
      }
    },

    async addNote(row) {
      let note = "test note";
      await this.addNewNote(row.id, note);
    },

    async addNewNote(word_id, note) {
      this.operation = true;
      let base_url = "https://zc74t809r.dexie.cloud";
      let token = await this.getGlobalToken();

      let item = {
        word_id: word_id,
        note: note,
      };

      let edit_mode = false;
      if (edit_mode) {
        item.id = this.edit_id;
        let deleted = await this.deleteNote(item.id);
        if (!deleted) {
          return;
        }
      }

      await axios
        // axios
        .post(`${base_url}/public/notes`, item, {
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

      this.operation = false;
    },
    async deleteNote(id) {
      var result = confirm("Are you sure you want to delete this word?");
      if (result) {
        this.operation = true;
        let dbid = process.env.DBID;
        let base_url = "https://zc74t809r.dexie.cloud";
        let token = await this.getGlobalToken();

        let deleted = false;
        await axios
          .delete(`${base_url}/public/notes/${id}`, {
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
          //
        }
        this.operation = false;
        return deleted;
      }
    },
    async getGlobalToken() {
      let base_url = "https://zc74t809r.dexie.cloud";
      // let client_id = process.env.clientId;
      // let client_secret = process.env.clientSecret;
      let client_id = "r0mmsm2ivu891imp";
      let client_secret = "+pGmqj3GBYZdQ8kcAooMF1kCrk10dSLc+rPNE7gYzPw=";

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

    decrypt(data) {
      // In Node.js

      // In the browser, CryptoJS is available globally
      // Make sure you have included the script in your HTML file

      // Encryption function
      function encryptObject(object, secretKey) {
        const plaintext = JSON.stringify(object);
        const ciphertext = CryptoJS.AES.encrypt(
          plaintext,
          secretKey
        ).toString();
        return ciphertext;
      }

      // Decryption function
      function decryptObject(ciphertext, secretKey) {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(plaintext);
      }
      // Example usage
      // const secretKey = "yourSecretKey";
      const secretKey = "oGR7nJT4u9fmjHhbrSJTKQAN6Jqyedm4";
      const decryptedData = decryptObject(data, secretKey);
      // console.log("Decrypted:", decryptedData);

      return decryptedData;
    },
  },
});
</script>
