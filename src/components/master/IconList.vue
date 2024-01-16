<template>
  <div class="flex flex-center q-pa-sm">
    <q-card
      v-for="(icon, idx) in icons"
      :key="idx"
      class="flex column items-center q-pa-sm q-ma-sm cursor-pointer"
      @click="selectIcon(icon)"
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
    </q-card>
    <q-card
      class="flex column items-center q-pa-sm q-ma-sm cursor-pointer q-gutter-y-sm"
    >
      <div class="flex row q-gutter-x-sm items-center">
        <q-input outlined v-model="mdi_icon" label="MDI icon"></q-input>
        <q-icon size="xl" :name="mdi_icon"></q-icon>
      </div>

      <q-btn flat no-caps @click="noIcon()">Select</q-btn>
    </q-card>
  </div>
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
  },
  data() {
    return {
      select_icon: null,
      mdi_icon: "mdi-snail",
    };
  },
  mounted() {
    //
  },
  methods: {
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
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
