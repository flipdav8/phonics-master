<template>
  <div class="fit q-pa-md">
    <!-- NEW Course -->
    <q-card
      v-if="add_course && !operation"
      flat
      class="fit flex flex-center column"
    >
      <q-card-section class="fit">
        <q-list>
          <q-item>
            <q-item-section avatar>Label:</q-item-section>
            <q-item-section>
              <q-input outlined v-model="new_course.label"></q-input>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>Info:</q-item-section>
            <q-item-section>
              <q-input
                outlined
                v-model="new_course.text"
                type="textarea"
                autogrow
              ></q-input>
            </q-item-section>
          </q-item>

          <div class="q-ma-md flex column">
            <VueDraggable
              v-model="new_course.units"
              animation="150"
              :sort="true"
              class="flex column q-mx-sm q-gutter-sm items-center"
            >
              <div
                v-for="(s, idx) in new_course.units"
                :key="idx"
                class="flex row items-center my-pill fit justify-between q-px-sm q-mt-md q-pa-sm"
              >
                <!-- UNIT -->
                <div class="col-2">
                  <q-select
                    label="Unit"
                    outlined
                    :options="
                      units.map((e) => ({ id: e.id, label: e.unit.label }))
                    "
                    v-model="s.unit"
                    clearable
                    dense
                    @update:model-value="(e) => selectUnit(e, s)"
                  >
                  </q-select>
                </div>
                <!-- LABEL -->
                <div>
                  <q-input label="Label" outlined v-model="s.label" dense>
                  </q-input>
                </div>

                <!-- TYPE -->
                <div>
                  <q-select
                    label="Type"
                    outlined
                    :options="unit_types"
                    v-model="s.type"
                    dense
                  >
                  </q-select>
                </div>

                <!-- TARGET -->
                <div>
                  <q-input
                    label="Word Correct Target"
                    type="number"
                    step="1"
                    outlined
                    v-model="s.target"
                    dense
                  >
                  </q-input>
                </div>
                <!-- <q-btn flat no-caps size="sm" @click="getWordCount(s)">
                  Get
                </q-btn> -->
                <div>
                  words:
                  {{ s.word_count }}
                </div>

                <!-- <q-btn
              icon="mdi-pencil-plus-outline"
              flat
              @click="editUnit(idx)"
            ></q-btn> -->

                <!-- DELETE -->
                <q-btn
                  icon="mdi-delete-outline"
                  color="red"
                  flat
                  @click="removeUnit(idx)"
                ></q-btn>

                <div
                  v-if="edit_unit == idx"
                  class="col-12 q-my-sm flex row justify-around items-center"
                >
                  More things to edit..
                </div>
              </div>
            </VueDraggable>

            <q-btn
              flat
              icon-right="mdi-plus"
              size="md"
              @click="addUnit()"
              no-caps
              >Add Unit</q-btn
            >

            <q-btn
              flat
              icon-right="mdi-plus"
              size="md"
              @click="addUnitAll()"
              no-caps
              >Add Unit (all)</q-btn
            >
          </div>
        </q-list>
      </q-card-section>

      <q-card-section class="self-end q-gutter-x-sm">
        <q-btn no-caps @click="cancelNew()">Cancel</q-btn>

        <q-btn
          color="green"
          no-caps
          :disable="new_course.units.length < 1"
          @click="addCourse()"
        >
          {{ edit_id === null ? "Add New Course" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>
    <div v-if="operation">
      <q-linear-progress query color="secondary" class="q-my-sm" rounded />
    </div>
    <q-table
      :columns="columns"
      :rows="course_rows"
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
        <q-btn @click="addNew()" no-caps color="green"> Add Course </q-btn>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="mdi-pencil-outline"
            flat
            @click="editCourse(props.row.course, props.row.id)"
          ></q-btn>

          <q-btn
            icon="mdi-close"
            flat
            @click="deleteCourse(props.row.id)"
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

export default defineComponent({
  name: "UnitsPage",
  components: {},
  props: {
    units: {},
    course_rows: {},
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
      // units: [],
      courses: [],
      new_course: null,
      new_unit: null,
      add_course: false,
      add_unit: false,
      edit_course: null,
      // course_rows: [],
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
          field: "units",
          label: "Units",
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
      course_template: {
        id: 0,
        type: "original", // maybe add more types later
        label: "Course Name",
        info: "text..",
        units: [],
        version: 0,
      },

      unit_types: ["normal", "revision"],
      unit_template: {
        id: null,
        unit: null,
        target: 3,
        label: "",
        type: "normal",
        word_count: 0,
      },

      edit_unit: null,
      operation: false,
    };
  },
  mounted() {
    // this.getCoursesAPI();
    // this.addNew();
  },

  methods: {
    async getCoursesAPI() {
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;

      let vm = this;
      await axios
        // .get(`${base_url}/public/public_test`, {
        .get(`${base_url}/public/courses`, {
          headers: {
            // "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          vm.courses = response.data;
          vm.makeRows();
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },

    addNew() {
      if (this.add_course) {
        this.cancelNew();
      } else {
        this.add_course = true;
        this.new_course = JSON.parse(JSON.stringify(this.course_template));
      }
    },

    cancelNew() {
      this.add_course = false;
      this.edit_id = null;
      this.new_course = null;
    },
    editCourse(course, item_id) {
      this.edit_id = item_id;
      this.new_course = { ...this.course_template, ...course };

      this.add_course = true;
    },

    addUnit() {
      this.new_course.units.push(
        JSON.parse(JSON.stringify(this.unit_template))
      );
    },

    addUnitAll() {
      for (let index = 0; index < this.units.length; index++) {
        const unit = this.units[index];
        this.new_course.units.push(
          JSON.parse(JSON.stringify(this.unit_template))
        );
        this.new_course.units[this.new_course.units.length - 1].unit = {
          id: unit.id,
          label: unit.unit.label,
        };
        this.new_course.units[this.new_course.units.length - 1].id =
          unit.id + `-${this.new_course.units.length}`;

        this.new_course.units[this.new_course.units.length - 1].label =
          unit.unit.label;

        this.getWordCount(
          this.new_course.units[this.new_course.units.length - 1]
        );
      }
    },
    editUnit(idx) {
      if (this.edit_unit === idx) {
        this.edit_unit = null;
      } else {
        this.edit_unit = idx;
      }
    },

    // TODO: be careful changing id..
    selectUnit(e, s) {
      // (e) =>
      //   e !== null
      //     ? (s["id"] = e.id + `-${new_course.units.length}`)
      //     : (s["id"] = null);

      if (e !== null) {
        s["id"] = e.id + `-${this.new_course.units.length}`;
        s.label = e.label;
      } else {
        s["id"] = null;
        s.label = "";
      }
      // console.log("s", s);

      this.getWordCount(s);
    },

    removeUnit(idx) {
      this.new_course.units.splice(idx, 1);
    },

    async addCourse() {
      this.operation = true;
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      // let token = this.accounts.currentUser.accessToken;
      let token = await this.getGlobalToken();

      // this.new_course.id = this.units.length + 1;

      let item = {
        region: "AU",
        course: this.new_course,
        // realmId: realmId,
      };

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;
        let deleted = await this.deleteCourse(item.id);
        if (!deleted) {
          return;
        }
        item.course.version++;
        item["version"] = item.course.version;
      }

      await axios
        .post(`${base_url}/public/courses`, [item], {
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
      // this.getCoursesAPI();
      this.$emit("refresh");
      this.operation = false;
    },
    async deleteCourse(id) {
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
          .delete(`${base_url}/public/courses/${id}`, {
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
          this.$emit("removeCourse");
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

    getWordCount(s) {
      let unit_id = s.unit.id;
      let unit = this.units.find((e) => e.id === unit_id);
      if (unit == undefined) return;
      let word_count = unit.unit.words.length;
      s["word_count"] = word_count;
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
