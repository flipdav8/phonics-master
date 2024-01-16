<template>
  <div class="flex flex-center q-pa-sm">
    <q-card
      v-for="(sound, idx) in sounds"
      :key="idx"
      class="flex column items-center q-pa-sm q-ma-sm"
      :class="{ selected: model_sound !== null && model_sound.id === sound.id }"
    >
      {{ sound.label }}
      <br />
      <br />

      <q-btn
        style="font-size: 20px"
        icon="mdi-volume-high"
        @click="playSound(sound)"
      >
      </q-btn>
      <q-btn style="font-size: 20px" @click="selectSound(sound)" flat>
        Select</q-btn
      >
    </q-card>
    <q-card
      class="flex column items-center q-pa-sm q-ma-sm cursor-pointer"
      @click="noSound()"
    >
      None
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
  name: "sound-list",
  components: {},
  props: {
    sounds: { required: true },
    model_sound: {},
  },
  data() {
    return {
      select_sound: null,
    };
  },
  mounted() {
    //
  },
  methods: {
    selectSound(sound) {
      this.select_sound = sound;
      let set_sound = { src: sound.src, label: sound.label, id: sound.id };
      this.$emit("update:model_sound", set_sound);
      this.$emit("close");
    },

    noSound() {
      this.$emit("update:model_sound", null);
      this.$emit("close");
    },

    playSound(sound) {
      const audio = new Audio(sound.src);
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
