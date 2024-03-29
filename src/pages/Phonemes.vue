<template>
  <q-page class="flex flex-center column" dark>
    <!-- <q-btn @click="test()">Test</q-btn> -->
    <!-- <div>hello {{ products[1] }}</div> -->
    <div class="flex row q-ma-sm q-gutter-sm">
      <q-select
        v-model="voice"
        :options="voices"
        outlined
        dense
        label="voice"
      ></q-select>
      <q-input type="textarea" autogrow outlined dense v-model="text"></q-input>
      <q-btn no-caps flat size="sm" @click="playAzure(undefined, this.text)">
        Play
      </q-btn>
    </div>
    <div class="flex row q-ma-sm q-gutter-sm">
      <q-input v-model="filter" dense outlined></q-input>
      <q-select
        v-model="class_filter"
        dense
        outlined
        :options="classes"
        multiple
      ></q-select>

      <q-btn @click="consoleList">Console</q-btn>
    </div>

    <q-table
      class="fit"
      :rows="filter_rows"
      :columns="columns"
      :pagination="initialPagination"
      :filter="filter"
      row-key="label"
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
            <div
              v-if="
                class_filter.length < 1 ||
                (props.row.classes != undefined &&
                  props.row.classes.includes(class_filter[0]))
              "
            >
              <div v-if="col.name === 'actions'">
                <q-btn no-caps @click="edit(props.row)">Edit</q-btn>
                <q-btn no-caps @click="clone(props.row)">Clone</q-btn>
              </div>
              <div v-else-if="col.name === 'icon_name'">
                <span v-if="props.row['classes'] != undefined">
                  <q-chip
                    v-if="props.row['classes'].includes('vowel')"
                    color="yellow"
                    size="sm"
                  >
                    vowel
                  </q-chip>

                  <q-chip
                    v-if="props.row['classes'].includes('semi-vowel')"
                    color="yellow-2"
                    size="sm"
                  >
                    semi-v
                  </q-chip>

                  <q-chip
                    v-if="props.row['classes'].includes('consonant')"
                    color="teal"
                    size="sm"
                  >
                    Cons.
                  </q-chip>

                  <q-chip
                    v-if="props.row['classes'].includes('ghost')"
                    color="grey"
                    size="sm"
                  >
                    Ghost
                  </q-chip>
                </span>

                <component
                  :is="col.value"
                  :color="'grey-10'"
                  :label="false"
                  :dots="false"
                  :center="true"
                  :scale="true"
                  style="border-radius: 10px; font-size: 40px"
                  class="overflow-hidden"
                ></component>

                <q-chip
                  v-if="props.row['replace_with'] != undefined"
                  color="purple"
                >
                  {{ props.row["replace_with"] }}
                </q-chip>

                <span v-if="props.row['classes'] != undefined">
                  <q-chip
                    v-if="props.row['classes'].includes('allophone')"
                    color="orange"
                    size="sm"
                  >
                    Allophone
                  </q-chip>

                  <q-chip
                    v-if="props.row['classes'].includes('blend')"
                    color="pink"
                    size="sm"
                  >
                    Blend
                  </q-chip>
                </span>

                <q-chip
                  v-if="props.row['redo_round'] || props.row['extra']"
                  color="green"
                  size="sm"
                >
                  +
                </q-chip>
              </div>

              <div v-else>{{ col.value }}</div>
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props" :key="props.row.id">
          <q-td colspan="100%">
            <div>
              expanded..
              <br />
              <!-- <q-btn @click="props.row['replace_with'] = undefined"
                >remove replce with</q-btn
              > -->
              <q-btn @click="props.row['test'] = ['a']">change..</q-btn>

              <q-btn @click="props.row['extra'] = true">extra</q-btn>
              <q-btn @click="props.row['redo_round'] = true">redo</q-btn>
              <q-btn @click="playAzure(props.row)">play</q-btn>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="props.row['cube']"
                  label="cube ascii"
                  outlined
                  dense
                  style="max-width: 80px"
                ></q-input>
                <q-input
                  v-model="props.row['cube_ipa']"
                  label="cube ipa"
                  outlined
                  dense
                  style="max-width: 80px"
                ></q-input>

                <q-input
                  v-model="props.row['tts_phoneme']"
                  label="tts ipa"
                  outlined
                  dense
                  style="max-width: 80px"
                ></q-input>
                <q-checkbox
                  v-model="props.row['tts']"
                  label="easy tts?"
                ></q-checkbox>
                <q-select
                  v-model="props.row['classes']"
                  :options="classes"
                  label="phoneme class"
                  outlined
                  dense
                  multiple
                ></q-select>
                <q-checkbox
                  v-model="props.row['blend']"
                  label="blend"
                ></q-checkbox>
                <q-checkbox
                  v-model="props.row['allophone']"
                  label="allophone"
                ></q-checkbox>

                <q-input
                  v-if="props.row['allophone']"
                  v-model="props.row['allophone_of']"
                  label="allophone of"
                  outlined
                  dense
                  style="max-width: 80px"
                ></q-input>

                <q-checkbox
                  v-model="props.row['r-separated']"
                  label="r-separated"
                ></q-checkbox>
              </div>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="props.row['accent variations']"
                  label="accent variations"
                  outlined
                  dense
                ></q-input>
              </div>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="props.row['replace_with']"
                  label="replace with"
                  outlined
                  dense
                ></q-input>
              </div>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="props.row['notes']"
                  label="notes"
                  outlined
                  dense
                  autogrow
                  type="textarea"
                ></q-input>
              </div>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="extra_spelling"
                  label="more spelling"
                  outlined
                  dense
                ></q-input>

                <q-btn @click="props.row['more_spellings'].push(extra_spelling)"
                  >Add More Spelling</q-btn
                >
                <!-- <q-btn @click="props.row['more_spellings'].pop()"
                  >Remove last Spelling</q-btn
                > -->

                <!-- <q-btn @click="props.row['more_spellings'] = []"
                  >Add spellings</q-btn
                > -->
              </div>

              <div class="flex q-gutter-md q-ma-sm">
                <q-input
                  v-model="extra_spelling"
                  label="extra spelling"
                  outlined
                  dense
                ></q-input>

                <q-btn
                  @click="props.row['extra_spellings'].push(extra_spelling)"
                  >Add Extra Spelling</q-btn
                >
                <!-- <q-btn @click="props.row['extra_spellings'].pop()"
                  >Remove last Spelling</q-btn
                > -->

                <q-btn @click="props.row['extra_spellings'] = []"
                  >Add Extra</q-btn
                >
              </div>

              <div style="max-width: 1600px; overflow: hidden">
                <div v-for="(value, key) in props.row" :key="key">
                  {{ key }} : {{ value }}
                </div>
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

// import PHONEMES from "/src/components/icons/phonemes.js";
// const phonemes = PHONEMES.list;

let mydb = null;

export default defineComponent({
  name: "IndexPage2.0",
  components: {},
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
    };
  },
  data() {
    return {
      syncdb: null,
      products: [],
      phonemes: [],
      columns: [
        // {
        //   name: "id",
        //   field: "id",
        //   label: "ID",
        //   align: "left",
        // },
        {
          name: "list_id",
          field: "list_id",
          label: "list_id",
          align: "center",
          sortable: true,
        },
        {
          name: "label",
          field: "label",
          label: "label",
          sortable: true,
          align: "center",
        },
        {
          name: "icon_name",
          field: "icon_name",
          label: "icon_name",
          align: "center",
        },

        // {
        //   name: "same",
        //   field: "same",
        //   label: "same",
        //   align: "center",
        // },

        // {
        //   name: "warning",
        //   field: "warning",
        //   label: "warning",
        //   align: "center",
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

      voice: "en-AU-TinaNeural",
      voices: ["en-AU-TinaNeural", "en-AU-KenNeural"],
      text: "book",
      classes: [
        "consonant",
        //manner group
        "obstruent",
        "sonorant",
        // manner
        "plosive",
        "fricative",
        "affricate",
        //voiced
        "fortis",
        "lenis",

        "sibilant",
        "voiceless obstr",
        "voiced obstr",

        "approximant",
        // place
        "labial",
        "bilabial",
        "labiodental",
        "coronal",
        "dental",
        "alveolar",
        "post-alveolar",
        "palatal",
        "dorsal",
        "velar",
        "glottal",

        "nasal",

        // tongue
        "liquid",
        "central",
        "rhotic",
        "lateral",
        //

        "glide",
        "semi-vowel",

        "allophone",
        "blend",

        "vowel",
        "long vowel",
        "short vowel",
        "diphthong",
        "closing diphthong",
        "r-separated",
        //
        "ghost", //basically a glide,
        "ghost-sound",
      ],
      class_filter: [],
      filter: "",
      extra_spelling: "",
    };
  },
  mounted() {
    this.setup();
  },

  computed: {
    filter_rows() {
      let rows = [];

      for (let idx = 0; idx < this.rows.length; idx++) {
        const element = this.rows[idx];
        let classes = element.classes;
        if (this.class_filter.length > 0 && classes != undefined) {
          let add = true;
          for (let ii = 0; ii < this.class_filter.length; ii++) {
            const filter_class = this.class_filter[ii];
            if (classes.includes(filter_class)) {
              //
            } else {
              add = false;
              break;
            }
          }
          if (add) {
            rows.push(element);
          }
          // for (let index = 0; index < classes.length; index++) {
          //   const look_class = classes[index];
          //   if (this.class_filter.includes(look_class)) {
          //     rows.push(element);
          //     break; // makes or
          //   }
          // }
        } else {
          if (this.class_filter.length < 1) {
            rows.push(element);
          }
        }
      }

      return rows;
    },
  },
  methods: {
    async setup() {
      await setupSync();
      // this.syncdb.cloud.login();
      // this.currentUser = useObservable(this.syncdb.cloud.currentUser);
      // this.userPrompts = useObservable(this.syncdb.cloud.userInteraction);
      // console.log("subscription", this.accountStore.subscription);

      // this.getTest();
      this.getPhonemesAPI();
    },

    async getTest() {
      try {
        this.phonemes = await syncdb.phonemes.toArray();
        console.log("this.phonemes", this.phonemes);
        this.rows = this.phonemes;
        // this.createRows();
      } catch (error) {
        let status = `Failed to read ...: ${error}`;
        console.log("status error", status);
      }
    },

    async getPhonemesAPI() {
      let dbid = "zc74t809r";
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        // .get(`${base_url}/public/public_test`, {
        .get(`${base_url}/public/phonemes`, {
          headers: {
            // "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          // console.log("UNITS api", response);
          vm.phonemes = response.data;
          vm.rows = vm.phonemes;
          // vm.createRows
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },

    createRows() {
      for (let index = 0; index < this.phonemes.length; index++) {
        const element = this.phonemes[index];
        //
      }
    },

    async edit(item) {
      console.log("item", item);
      await this.editPhoneme(item);
      this.getPhonemesAPI();
    },

    async clone(item) {
      console.log("item", item);
      await this.editPhoneme(item, true);
      this.getPhonemesAPI();
    },

    async editPhoneme(edit_item, clone) {
      this.operation = true;
      let realmId = "rlm-public";

      let base_url = "https://zc74t809r.dexie.cloud";
      let token = await this.getGlobalToken();

      let item = {};

      if (edit_item != undefined) {
        item = edit_item;

        if (clone == undefined) {
          let deleted = await this.deletePhoneme(item.id, true);
          if (!deleted) {
            return;
          }
        } else {
          item.id = item.id + "-clone";
          item.list_id = this.rows.length + 1;
        }
      } else {
        console.log("only edit..");
        return;
      }

      await axios
        .post(`${base_url}/public/phonemes`, item, {
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
    }, //api version

    async deletePhoneme(id, editing) {
      if (editing == undefined) {
        var result = confirm("Are you sure you want to delete this course?");
      } else {
        var result = true;
      }

      if (result) {
        this.operation = true;
        let base_url = "https://zc74t809r.dexie.cloud";
        let token = await this.getGlobalToken();

        let deleted = false;
        await axios
          .delete(`${base_url}/public/phonemes/${id}`, {
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

    async playAzure(phoneme, text) {
      console.log("phoneme", phoneme);

      const headers = {
        // Accept: "audio/mpeg",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        // Authorization: "Bearer " + token,
        "Content-Type": "application/ssml+xml",
        // "User-Agent": "speech-test-2",
        "X-Microsoft-OutputFormat": "riff-44100hz-16bit-mono-pcm",
      };

      //see https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#audio-outputs

      // const region = process.env.AZURE_SPEECH_REGION;

      // const get_voices = await axios.get(
      //   `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      //   {
      //     headers: headers,
      //   }
      // );

      // console.log("get_voics", get_voices);

      // <phoneme alphabet="ipa" ph="θ"> tomato </phoneme>

      let voice_id = this.voice;
      // let voice_id = "en-AU-NeilNeural";
      // let voice_id = "en-AU-KenNeural";
      // const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">a cool pickly went dancing</voice></speak>`;
      // let ipa = "θ";

      let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">
       test
        </voice></speak>`;

      if (phoneme != undefined) {
        if (phoneme.sound_src != undefined) {
          var audio = new Audio(`${phoneme.sound_src}`);
          audio.play();
        }

        let ipa = phoneme.IPA_symbol;
        // let ipa = "ʉ";
        // let ipa = "uː";
        if (phoneme.tts_phoneme) {
          ipa = phoneme.tts_phoneme;
        }

        console.log("ipa_symbol", ipa);

        ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">
        <phoneme alphabet="ipa" ph="${ipa}"></phoneme>
        </voice></speak>`;
      } else if (text != undefined) {
        ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">
       ${text}
        </voice></speak>`;
      }

      let endpoint =
        "https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1";

      const body = ssml;

      const voice_response = await axios.post(endpoint, body, {
        headers: headers,
        // responseType: "arraybuffer", // This is important for handling binary data
        responseType: "blob",
      });

      console.log("voice_response", voice_response);
      // return;

      const audio1 = new Audio(URL.createObjectURL(voice_response.data));
      audio1.play();
    },

    consoleList() {
      console.log(this.rows);
    },
  },
});
</script>
