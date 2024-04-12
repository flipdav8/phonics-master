<template>
  <div class="flex row full-width">
    <div
      class="flex row col-12 justify-around"
      v-for="(group, idx) in forms"
      :key="idx"
    >
      <div class="flex column col-3 text-center">
        <div @click="show_prefix = !show_prefix">{{ group.pidx.length }}</div>
        <div v-show="show_prefix">
          <div v-for="prefix in group.pidx" :key="prefix">
            <span
              v-for="part in getPrefix(prefix)"
              :key="part"
              :class="part.class"
            >
              {{ part.show }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex column col-3 text-center">
        <div @click="show_suffix = !show_suffix">
          {{ group.sidx.length }}
        </div>
        <div v-show="show_suffix">
          <div v-for="suffix in group.sidx" :key="'s' + suffix">
            <span
              v-for="part in getSuffix(suffix)"
              :key="part"
              :class="part.class"
            >
              {{ part.show }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex column col-3 text-center">
        <div @click="show_both = !show_both">
          {{ group.bidx.length }}
        </div>

        <div v-show="show_both">
          <div v-for="both in group.bidx" :key="'s' + both">
            <span v-for="part in getBoth(both)" :key="part" :class="part.class">
              {{ part.show }}
            </span>
          </div>
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

import prefixes from "./prefixes.json";
import suffixes from "./suffixes.json";

export default defineComponent({
  // name: "forms",
  components: {
    // MoveLetters
  },
  props: {
    forms: { required: true },
    word: { required: true },
  },
  setup() {
    return {
      // phonemes,
      prefixes,
      suffixes,
    };
  },
  data() {
    return {
      pattern: [],
      mounted: false,
      icon_name: null,

      show_prefix: false,
      show_suffix: false,
      show_both: false,
    };
  },
  mounted() {
    // this.setupWord();
    this.mounted = true;
  },
  computed() {},
  methods: {
    getPrefix(prefix) {
      let split = prefix.split("_");
      let prefix_text = prefixes.find((e) => e.i == split[1]);
      if (prefix_text != undefined) {
        return [
          {
            show: prefix_text.prefix,
            class: ["text-bold"],
          },
          // { show: this.word, class: [] },
          { show: "...", class: [] },
        ];
      } else {
        return null;
      }
    },

    getSuffix(suffix) {
      let split = suffix.split("_");
      let suffix_text = suffixes.find((e) => e.i == split[1]);

      let dropped = split[2];
      let added = split[3];

      // console.log("dropped", dropped);
      // console.log("added", added);

      if (suffix_text != undefined) {
        // return [suffix_text.suffix];

        let base = [{ show: "...", class: [] }];
        if (dropped) {
          base.push({
            show: dropped,
            class: ["text-red text-strike"],
          });
        }

        if (added) {
          base.push({
            show: added,
            class: ["text-green"],
          });
        }
        base.push({
          show: suffix_text.suffix,
          class: ["text-bold"],
        });
        return base;
      } else {
        return null;
      }
    },

    getBoth(suffix) {
      let split = suffix.split("_");
      let prefix_text = prefixes.find((e) => e.i == split[1].split("-")[0]);
      let suffix_text = suffixes.find((e) => e.i == split[1].split("-")[1]);

      let dropped = split[2];
      let added = split[3];

      if (suffix_text != undefined && prefix_text !== undefined) {
        let base = [
          {
            show: prefix_text.prefix,
            class: ["text-bold"],
          },
          { show: "...", class: [] },
        ];
        if (dropped) {
          base.push({
            show: dropped,
            class: ["text-red text-strike"],
          });
        }

        if (added) {
          base.push({
            show: added,
            class: ["text-green"],
          });
        }
        base.push({
          show: suffix_text.suffix,
          class: ["text-bold"],
        });
        return base;
      } else {
        return null;
      }
    },
  },
});
</script>

<style></style>
