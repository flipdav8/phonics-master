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

    <q-card-section class="text-center q-gutter-x-sm">
      <q-toggle
        v-model="multiple"
        label="multiple?"
        @update:model-value="multipleChange"
      ></q-toggle>
      <q-btn :disable="!multiple" @click="selectHoms(icon)">
        Select Selection</q-btn
      >
    </q-card-section>
    <q-card-section class="flex row justify-center">
      <q-card
        v-for="(icon, idx) in filterIcons"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-auto"
        style="border-radius: 10px"
        :class="{
          selected:
            (model_icon !== null &&
              model_icon.id !== undefined &&
              model_icon.id === icon.id &&
              !multiple) ||
            selected.map((e) => e.id).includes(icon.id),
        }"
        @click="selectHom(icon)"
      >
        {{ icon.label }}

        <q-icon style="font-size: 120px">
          <img
            :src="`/homophone-icons/${icon.value.split('/')[0]}/${
              icon.label
            }.svg`"
            type="image/svg+xml"
          />
        </q-icon>

        <q-btn :disable="multiple" @click="selectIcon(icon)" color="green">
          Select</q-btn
        >
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
    homophones: { required: true },
    word: { required: true },
    model_icon: {},
    letters: {},
  },
  data() {
    return {
      select_icon: null,
      search: "",
      multiple: false,
      selected: [],
    };
  },
  mounted() {
    this.search = this.word.word;
  },
  computed: {
    filterIcons() {
      return this.homophones.filter((e) => this.searchFilter(e));
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

    selectIcon(icon) {
      this.select_icon = icon;
      let set_icon = {
        src: `${icon.value.split("/")[0]}/${icon.label}`,
        label: icon.label,
        name: icon.value,
        id: icon.id,
      };
      this.$emit("update:model_icon", set_icon);
      this.$emit("close");
    },

    noIcon() {
      this.$emit("update:model_icon", this.mdi_icon);
      this.$emit("close");
    },

    nullIcon() {
      this.$emit("update:model_icon", null);
      this.$emit("close");
    },

    mdiIcons() {
      let url = "https://pictogrammers.com/library/mdi/";
      window.open(url, "_blank").focus();
    },
    multipleChange() {
      this.select_icon = null;
    },
    selectHom(icon) {
      let set_icon = {
        src: `${icon.value.split("/")[0]}/${icon.label}`,
        label: icon.label,
        name: icon.value,
        id: icon.id,
      };

      if (this.selected.map((e) => e.id).includes(icon.id)) {
        let r = this.selected.findIndex((e) => e.id === icon.id);
        this.selected.splice(r, 1);
      } else {
        this.selected.push(set_icon);
      }
    },

    selectHoms(icon) {
      if (this.selected.length < 1) return;

      let set_icon = this.selected[0];
      if (this.selected.length > 1) {
        set_icon["more"] = this.selected.slice(1); // index 1+
      }

      this.$emit("update:model_icon", set_icon);
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
