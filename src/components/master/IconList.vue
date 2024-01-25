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
        v-for="(icon, idx) in filterIcons"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-auto"
        style="border-radius: 10px"
        :class="{
          selected:
            model_icon !== null &&
            model_icon.id !== undefined &&
            model_icon.id === icon.id,
        }"
      >
        {{ icon.label }}

        <q-icon style="font-size: 120px">
          <img :src="icon.src" type="image/svg+xml" />
        </q-icon>

        <q-btn @click="selectIcon(icon)" color="green"> Select</q-btn>
        <br />
      </q-card>

      <q-card
        class="flex column items-center justify-center q-pa-sm q-ma-sm cursor-pointer q-gutter-y-sm col-auto"
        style="border-radius: 10px"
      >
        <q-input outlined v-model="mdi_icon" label="MDI icon">
          <template v-slot:after>
            <q-btn icon="mdi-link" @click="mdiIcons()" flat round></q-btn>
          </template>
        </q-input>
        <q-icon size="xl" :name="mdi_icon"></q-icon>

        <q-btn @click="noIcon()" color="green"> Select</q-btn>
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
    icons: { required: true },
    model_icon: {},
    letters: {},
  },
  data() {
    return {
      select_icon: null,
      mdi_icon: "mdi-egg-outline",
      search: "",
    };
  },
  mounted() {
    if (this.letters != undefined) {
      // this.search = this.letters;
    }
  },
  computed: {
    filterIcons() {
      return this.icons.filter((e) => this.searchFilter(e));
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
      let set_icon = { src: icon.src, label: icon.label, id: icon.id };
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
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
