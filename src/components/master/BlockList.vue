<template>
  <div class="flex flex-center q-pa-sm">
    <q-card
      v-for="(block, idx) in blocks"
      :key="idx"
      class="flex column items-center q-pa-sm q-ma-sm"
      :class="{ selected: model_block != null && model_block.id === block.id }"
    >
      <strong class="text-h4">{{ block.label }} </strong>
      <div class="text-caption">{{ block.type }}</div>
      <div>{{ block.options.map((e) => e.label) }}</div>
      <q-btn style="font-size: 20px" @click="selectBlock(block)" flat>
        Select</q-btn
      >
    </q-card>
    <q-card
      class="flex column items-center q-pa-sm q-ma-sm cursor-pointer"
      @click="noblock()"
    >
      No Block
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
  name: "block-list",
  components: {},
  props: {
    blocks: { required: true },
    model_block: {},
    model_id: {},
  },
  data() {
    return {
      select_block: null,
      exclude: [],
    };
  },
  mounted() {
    //
  },
  methods: {
    selectBlock(block) {
      this.select_block = block;
      let set_block = { label: block.label, id: block.id };
      this.$emit("update:model_block", set_block);
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
