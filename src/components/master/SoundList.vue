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
        v-for="(sound, idx) in filterSounds"
        :key="idx"
        class="flex column items-center q-pa-sm q-ma-sm q-gutter-y-sm col-4"
        style="border-radius: 10px"
        :class="{
          selected: model_sound !== null && model_sound.id === sound.id,
        }"
      >
        <div class="text-h5">{{ sound.label }}</div>

        <q-btn
          style="font-size: 20px"
          icon="mdi-volume-high"
          @click="playSound(sound)"
        >
        </q-btn>

        <q-btn @click="selectSound(sound)" color="green"> Select</q-btn>
        <br />
      </q-card>
      <q-card
        class="flex column items-center justify-center q-pa-sm q-ma-sm cursor-pointer q-gutter-y-sm col-4"
        style="border-radius: 10px"
        @click="noSound()"
      >
        No Sound
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
  name: "sound-list",
  components: {},
  props: {
    sounds: { required: true },
    model_sound: {},
    letters: {},
    block: {},
    input: {},
  },
  data() {
    return {
      select_sound: null,
      search: "",
    };
  },
  mounted() {
    // console.log("this.letters", this.letters);

    if (this.input && this.block != undefined) {
      // console.log('this.block.label.split("/")', this.block.label.split("/"));
      if (this.block.label.includes("/")) {
        this.search = this.block.label.split("/")[1] + "-";
      }
    } else if (this.letters != undefined) {
      if (this.letters.includes("-")) {
        let split = this.letters.split("-");
        this.search = split[0] + split[1];
      } else {
        if (this.letters === "c") {
          this.search = "k-";
        } else if (this.letters === "ph") {
          this.search = "f-";
        } else if (this.letters === "kn") {
          this.search = "n-";
        } else {
          this.search = this.letters + "-";
        }
      }
    }
  },
  computed: {
    filterSounds() {
      return this.sounds.filter((e) => this.searchFilter(e));
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

    selectSound(sound) {
      this.select_sound = sound;
      let set_sound = {
        src: sound.src,
        // label: sound.label,
        id: sound.id,
      };
      this.$emit("update:model_sound", set_sound);
      this.$emit("close");
    },

    noSound() {
      this.$emit("update:model_sound", null);
      this.$emit("close");
    },

    playSound(sound) {
      // console.log("sound", sound);
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
