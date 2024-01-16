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

      <q-select
        class="col-4"
        dense
        outlined
        label="type"
        v-model="type"
        :options="['all', 'sound', 'spelling']"
      ></q-select>

      <q-btn flat icon="mdi-close" @click="$emit('close')"></q-btn>
    </q-card-section>

    <q-card-section class="flex row justify-center">
      <q-card
        v-for="(block, idx) in filterBlocks"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-auto"
        style="border-radius: 10px"
        :class="{
          selected: model_block != null && model_block.id === block.id,
        }"
      >
        <strong class="text-h4">{{ block.label }} </strong>
        <div class="text-caption">{{ block.type }}</div>
        <div>
          <q-chip square v-for="(option, i) in block.options" :key="i">
            {{ option.label }}
          </q-chip>
        </div>

        <q-btn @click="selectBlock(block)" color="green"> Select</q-btn>
        <br />
      </q-card>
      <q-card
        class="flex column items-center justify-center q-pa-sm q-ma-sm cursor-pointer col-auto hidden"
        style="border-radius: 10px"
        @click="noblock()"
      >
        No Block
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
  name: "block-list",
  components: {},
  props: {
    blocks: { required: true },
    model_block: {},
    model_id: {},
    filter_type: {},
  },
  data() {
    return {
      select_block: null,
      exclude: [],
      search: "",
      type: "all",
    };
  },
  mounted() {
    if (this.filter_type != undefined) {
      this.type = this.filter_type;
    }
    // console.debug("debug here");
  },

  computed: {
    filterBlocks() {
      return this.blocks.filter(
        (e) => this.typeFilter(e) && this.searchFilter(e)
      );
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
    typeFilter(e) {
      if (this.type === "all") {
        return true;
      } else {
        return e.type === this.type;
      }
    },

    selectBlock(block) {
      this.select_block = block;
      let set_block = { label: block.label, id: block.id };
      this.$emit("update:model_block", set_block);
      this.$emit("update", set_block);
      this.$emit("close");
    },

    noblock() {
      this.$emit("update:model_block", null);
      this.$emit("close");
    },

    playblock(block) {
      const audio = new Audio(block.src);
      audio.play();
    },
  },
});
</script>
<style>
.selected {
  border: solid 5px;
}
</style>
