<template>
  <q-card
    class="items-center q-pa-sm bg-blue-2"
    style="max-width: 1000px !important; border-radius: 20px"
  >
    <q-card-section class="col-12 flex row justify-center q-gutter-sm">
      <q-input dense outlined color="primary" v-model="search" label="search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-btn flat icon="mdi-close" @click="$emit('close')"></q-btn>
    </q-card-section>

    <q-card-section class="flex row justify-center">
      <q-card
        v-for="(phoneme, idx) in filterPhonemes"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-auto"
        style="border-radius: 10px"
        :class="{
          selected:
            model_icon !== null &&
            model_icon.id !== undefined &&
            model_icon.id === phoneme.id,
        }"
      >
        {{ phoneme.label }}

        <component
          v-if="phoneme.icon_name != undefined"
          :is="phoneme.icon_name"
          color="grey-10"
          :label="false"
          :dots="false"
          :center="true"
          :scale="true"
          style="border-radius: 10px; font-size: 100px"
          class="bg-grey overflow-hidden"
        ></component>
        <q-btn @click="selectPhoneme(phoneme)" color="green"> Select</q-btn>
        <br />
      </q-card>

      <q-card
        class="flex column items-center justify-center q-pa-sm q-ma-sm cursor-pointer q-gutter-y-sm col-auto"
        style="border-radius: 10px"
      >
        No Icon
        <q-btn @click="nullIcon()" color="green"> Select</q-btn>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

export default defineComponent({
  name: "icon-list",
  components: {},
  props: {
    phonemes: { required: true },
    model_icon: {},
    letters: {},
    block: {},
    input: {},
    type: {},
    correct: {},
    option: {},
  },
  data() {
    return {
      search: "",
    };
  },
  mounted() {
    if (this.letters != undefined) {
      // this.search = this.letters;
    }
    // console.log("this.input", this.input);
    // console.log("this.block", this.block);
    console.log("this.type", this.type);

    if (this.option != undefined) {
      if (this.option.schwa) {
        this.search = "schwa";
        return;
      }
    }

    if (this.type === "spelling" && this.input) {
      if (this.correct == null || this.correct.length < 1) {
        alert("missing correct");
      }
      this.search = this.correct;
    } else if (this.input && this.block != undefined) {
      // console.log('this.block.label.split("/")', this.block.label.split("/"));
      if (this.block.label.includes("/")) {
        this.search = this.block.label.split("/")[1];
      }
    } else if (this.letters != undefined) {
      if (this.letters.includes("-")) {
        let split = this.letters.split("-");
        this.search = split[0] + split[1];
      } else {
        if (this.letters === "c") {
          this.search = "k";
        } else if (this.letters === "ph") {
          this.search = "f";
        } else if (this.letters === "kn") {
          this.search = "n";
        } else {
          this.search = this.letters;
        }
      }
    }
  },
  computed: {
    filterPhonemes() {
      return this.phonemes.filter((e) => this.searchFilter(e));
    },
  },
  methods: {
    searchFilter(e) {
      // return e.label;
      return e.label
        .toLocaleLowerCase()
        .indexOf(this.search.toLocaleLowerCase()) > -1
        ? true
        : false;
    },

    selectPhoneme(phoneme) {
      let set_icon = {
        id: phoneme.id,
        label: phoneme.label,
        icon_name: phoneme.icon_name,
        sound_src: phoneme.sound_src,
      };
      this.$emit("update:model_icon", set_icon);
      this.$emit("close");
    },

    nullIcon() {
      this.$emit("update:model_icon", null);
      this.$emit("close");
    },
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
