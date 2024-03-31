<template>
  <div class="flex column" v-if="mounted">
    <div
      v-if="
        approvals.filter((e) => e.lids_changed || e.pids_changed).length > 0
      "
    >
      modifications made.. load todo..
    </div>
    <div class="flex row" v-for="(group, i) in ordered_letters" :key="i">
      <div class="flex row" v-show="variation_index === i">
        <div class="flex row" v-for="(l, idx) in group" :key="idx">
          <q-chip
            size="md"
            class="q-mt-md q-pa-none"
            square
            @click="clickPhoneme(idx)"
            clickable
            :class="
              search_phonemes
                .map((e) => e.list_id.toString())
                .includes(use_pids[idx])
                ? 'bg-green-3'
                : ''
            "
          >
            <!-- <div>{{ l }}</div> -->
            <!-- {{ phonemes.find((e) => e.list_id == use_pids[idx])?.icon_name }} -->
            <component
              v-if="
                phonemes.find((e) => e.list_id == use_pids[idx])?.icon_name !=
                undefined
              "
              :is="phonemes.find((e) => e.list_id == use_pids[idx])?.icon_name"
              :color="
                modified.includes(idx)
                  ? 'purple-4'
                  : $q.dark.mode
                  ? 'grey-1'
                  : 'grey-10'
              "
              :label="false"
              :dots="false"
              :center="true"
              :scale="true"
              style="border-radius: 10px; font-size: 40px"
              class="overflow-hidden cursor-pointer"
            ></component>
            <div v-else>
              <q-icon name="mdi-help"> </q-icon>
              {{ phonemes.find((e) => e.list_id == use_pids[idx]).label }}
            </div>
            <q-badge
              floating
              style="top: -15px"
              class="q-pa-xs text-black"
              :color="modified_letters.includes(idx) ? 'pink-4' : ''"
            >
              {{ l }}
            </q-badge>
            <!-- <q-badge
              class="absolute"
              style="bottom: -5px; left: -0px"
              color="transparent"
              v-if="stress_array[idx] != undefined && stress_array[idx] > 0"
            >
              <q-icon size="xs" color="green" name="mdi-circle"></q-icon>
            </q-badge> -->

            <div
              v-if="stress_array[idx] != undefined && stress_array[idx] > 0"
              class="absolute"
              style="bottom: -20px; left: 0px; right: 0px"
            >
              <span>▲</span>
            </div>
          </q-chip>
        </div>
      </div>
    </div>

    <div v-if="letters.length > 1" class="col-12">
      <br />
      <div v-if="!letters_changed">
        <q-btn flat color="grey" no-caps @click="changeVariation()">
          rotate variation
          <q-badge floating color="teal"> {{ variation_index }}</q-badge>
        </q-btn>
      </div>
    </div>

    <div v-if="letters_changed" class="col-12">
      <br />

      <q-banner
        inline-actions
        rounded
        class="text-black"
        :class="!valid_letters ? 'bg-warning' : 'bg-green'"
      >
        {{ !valid_letters ? "letters not valid" : "letters valid" }}
        <template v-slot:action>
          <q-btn size="sm" no-caps flat @click="revertChanges()">Reset</q-btn>
        </template>
      </q-banner>
    </div>

    <q-dialog v-model="dialog" @hide="closedDialog()">
      <q-card>
        <q-card-section class="q-ma-md">
          <div class="flex row" v-for="(group, i) in ordered_letters" :key="i">
            <div class="flex row" v-show="variation_index === i">
              <div class="flex row" v-for="(l, idx) in group" :key="idx">
                <q-chip
                  size="md"
                  class="q-mt-md q-pa-none"
                  square
                  @click="clickPhoneme(idx)"
                  :outline="idx === mod_index"
                  :class="idx === mod_index ? 'show_border' : 'disabled'"
                >
                  <div v-if="idx !== mod_index || change_phoneme == null">
                    <component
                      v-if="
                        phonemes.find((e) => e.list_id == use_pids[idx])
                          ?.icon_name != undefined
                      "
                      :is="
                        phonemes.find((e) => e.list_id == use_pids[idx])
                          ?.icon_name
                      "
                      :color="
                        modified.includes(idx)
                          ? 'purple-5'
                          : $q.dark.mode
                          ? 'grey-1'
                          : 'grey-10'
                      "
                      :label="false"
                      :dots="false"
                      :center="true"
                      :scale="true"
                      style="border-radius: 10px; font-size: 40px"
                      class="overflow-hidden"
                    ></component>
                    <div v-else>
                      <q-icon name="mdi-help"> </q-icon>
                      {{
                        phonemes.find((e) => e.list_id == use_pids[idx]).label
                      }}
                    </div>
                  </div>
                  <div v-else>
                    <component
                      v-if="
                        phonemes.find(
                          (e) => e.list_id == change_phoneme.list_id.toString()
                        )?.icon_name != undefined
                      "
                      :is="
                        phonemes.find(
                          (e) => e.list_id == change_phoneme.list_id.toString()
                        )?.icon_name
                      "
                      :color="'green'"
                      :label="false"
                      :dots="false"
                      :center="true"
                      :scale="true"
                      style="border-radius: 10px; font-size: 40px"
                      class="overflow-hidden"
                    ></component>
                    <div v-else>
                      <q-icon name="mdi-help"> </q-icon>
                      {{
                        phonemes.find(
                          (e) => e.list_id == change_phoneme.list_id.toString()
                        ).label
                      }}
                    </div>
                  </div>

                  <q-badge
                    floating
                    style="top: -15px"
                    class="q-pa-xs"
                    :color="modified_letters.includes(idx) ? 'pink' : ''"
                  >
                    <!-- {{ l }} -->
                    {{
                      idx === mod_index && change_letters.length > 0
                        ? change_letters
                        : l
                    }}
                  </q-badge>
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-item>Change Phoneme..</q-item>
          <q-select
            outlined
            v-model="change_phoneme"
            use-input
            option-label="label"
            input-debounce="0"
            :options="filteredOptions"
            use-chips
            @filter="filterFn"
            :hint="`currently: ${
              phonemes.find((e) => e.list_id == use_pids[mod_index])?.label
            }`"
            style="width: 250px; padding-bottom: 32px"
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
          <q-item>Change Grapheme..</q-item>
          <q-input
            outlined
            v-model="change_letters"
            :placeholder="`currently: ${ordered_letters[variation_index][mod_index]}`"
          ></q-input>
          <br />
        </q-card-section>
        <q-separator />
        <q-card-section class="flex row">
          <q-btn no-caps flat @click="backDialog()"> Back </q-btn>
          <q-space></q-space>
          <q-btn no-caps flat color="green" @click="makeChange()">
            Change
          </q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
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

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// import MoveLetters from "/src/components/animations/MoveLetters.vue";

export default defineComponent({
  name: "next-unit",
  components: {
    // MoveLetters
  },
  props: {
    letters: { required: true },
    pids: { required: true },
    variation_index: { default: 0 },
    stress: {},
    search_phonemes: {},
    approvals: {},
    word: {},
  },
  setup() {
    return {
      phonemes,
    };
  },
  data() {
    return {
      pattern: [],
      mounted: false,
      icon_name: null,
      stress_array: [],
      ordered_letters: [],
      use_pids: [],
      modified: [],
      modified_letters: [],
      mod_index: null,
      dialog: false,
      change_phoneme: null,
      change_letters: "",
      phonemes_options: [],
      options: [
        { name: "Test", value: "123", value2: "456" },
        { name: "Test 2", value: "321", value2: "456" },
        { name: "Test 3", value: "789", value2: "987" },
      ],
      filteredOptions: [],
      filterFields: ["label"],
      valid_letters: null,
      letters_changed: false,
    };
  },
  mounted() {
    // this.setupWord();
    if (this.stress != undefined) {
      this.stress_array = this.stress;
    }

    this.orderGraphemes(this.letters);

    this.use_pids = JSON.parse(JSON.stringify(this.pids));

    this.phonemes_options = phonemes;
    this.options = this.phonemes_options.filter((e) => e.icon_name != null);

    this.mounted = true;
  },
  methods: {
    getIconName() {},

    setupWord() {
      let pattern = [];
      for (let index = 0; index < this.phonemes.length; index++) {
        const ph = this.phonemes[index];
        pattern.push({
          letters: this.letters[index],
          options: shuffle(ph.more_spellings),
        });
      }
      this.pattern = pattern;
    },
    changeVariation() {
      if (this.letters_changed) {
        return;
      }

      if (this.variation_index < this.letters.length - 1) {
        this.$emit("changeVariation", this.variation_index + 1);
      } else {
        this.$emit("changeVariation", 0);
      }
    },

    orderGraphemes(letters) {
      if (letters.length > 1) {
        // console.log("letters", letters);
        //split spellings
        //double letters > other combos

        let vowels = ["a", "e", "i", "o", "u"];
        let touching = [];
        let not_touching = [];

        let array = JSON.parse(JSON.stringify(letters));
        for (let index = 0; index < array.length; index++) {
          const pattern = array[index];
          let touch_array = [];
          for (let xx = 0; xx < pattern.length; xx++) {
            const graphemes = pattern[xx];
            if (graphemes.includes("-") || graphemes.includes("^")) {
              touch_array.push(false);
              break;
            }

            if (this.word.includes("tion") && graphemes == "ti") {
              touch_array.push(false);
              break;
            }
            let chars = graphemes.split("");

            let char_types = [];
            for (let ww = 0; ww < chars.length; ww++) {
              const char = chars[ww];

              if (vowels.includes(char)) {
                char_types.push("v");
              } else {
                char_types.push("c");
              }
            }

            if (char_types.includes("v") && char_types.includes("c")) {
              touch_array.push(true);
            } else {
              touch_array.push(false);
            }
          }

          if (touch_array.filter((e) => e).length > 0) {
            touching.push(pattern);
          } else {
            not_touching.push(pattern);
          }
        }

        // if (this.word === "abandoned") {
        //   console.log("not_touching", not_touching);
        //   console.log("touching", touching);
        // }

        this.ordered_letters = [...not_touching, ...touching];
      } else {
        this.ordered_letters = JSON.parse(JSON.stringify(letters));
      }

      // this.ordered_letters = JSON.parse(JSON.stringify(letters));
      // this.ordered_letters = shuffle(letters);
      // return letters;
    },

    clickPhoneme(index) {
      this.mod_index = index;
      this.dialog = true;

      // this.use_pids.splice(index, 1, 1);
      // this.modified.push(index);
      // this.ordered_letters.unshift(this.letters[0].map((e) => "5"));
    },

    filterFn(val, update, abort) {
      update(() => {
        if (!val) {
          this.filteredOptions = [];
          return;
        }

        let filterValue = val.toLowerCase();
        this.filteredOptions = this.options.filter((v) => {
          let targetValue = "";
          this.filterFields.forEach((field) => {
            targetValue += v[field].toLowerCase();
          });
          return targetValue.indexOf(filterValue) > -1;
        });
      });
    },

    closedDialog() {
      this.mod_index = null;
      this.change_phoneme = null;
      this.change_letters = "";
    },

    backDialog() {
      this.mod_index = null;
      this.change_phoneme = null;
      this.change_letters = "";
      this.dialog = false;
    },

    makeChange() {
      if (this.change_phoneme != null) {
        this.use_pids.splice(
          this.mod_index,
          1,
          this.change_phoneme.list_id.toString()
        );
        this.modified.push(this.mod_index);
      }
      if (this.change_letters.length > 0) {
        if (this.letters_changed) {
          let change = this.ordered_letters[this.variation_index].map((e, i) =>
            i === this.mod_index ? this.change_letters : e
          );

          this.ordered_letters.splice(0, 1, change);
        } else {
          this.ordered_letters.unshift(
            this.ordered_letters[this.variation_index].map((e, i) =>
              i === this.mod_index ? this.change_letters : e
            )
          );
          this.$emit("changeVariation", 0);
          this.letters_changed = true;
        }

        this.modified_letters.push(this.mod_index);

        let check_with = this.letters[0].filter((e) => e !== "^").join("");
        let new_word = this.ordered_letters[0]
          .filter((e) => e !== "^")
          .join("");

        console.log("check_with", check_with);
        console.log("new_word", new_word);
        if (check_with !== new_word) {
          console.log("not yet valid..");
          this.valid_letters = false;
        } else {
          this.valid_letters = true;
        }
      }

      this.mod_index = null;
      this.change_phoneme = null;
      this.change_letters = "";

      this.dialog = false;
    },

    revertChanges() {
      this.use_pids = this.pids;
      this.orderGraphemes(this.letters);
      this.$emit("changeVariation", 0);
      this.modified = [];
      this.modified_letters = [];

      this.mod_index = null;
      this.change_phoneme = null;
      this.change_letters = "";

      this.letters_changed = false;
      this.valid_letters = null;
    },
  },
});
</script>

<style></style>
