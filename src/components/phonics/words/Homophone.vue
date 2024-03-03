<template>
  <div>
    <div v-if="mini" class="flex row items-center hiddens">
      <div v-if="word.homo.name != undefined" class="flex row items-center">
        <q-icon size="xl">
          <img
            :src="`/homophone-icons/${word.homo.src}.svg`"
            type="image/svg+xml"
          />
        </q-icon>
        <div v-if="word.homo.more !== undefined">
          <q-icon v-for="(m, i) in word.homo.more" :key="i" size="xl">
            <img
              :src="`/homophone-icons/${word.homo.more[i].src}.svg`"
              type="image/svg+xml"
            />
          </q-icon>
        </div>
      </div>
      <div v-else-if="word.homo.src != undefined">
        <q-icon
          size="lg"
          v-if="word.homo.src.includes('mdi')"
          :name="word.homo.src"
        ></q-icon>
        <q-icon v-else size="lg">
          <img :src="word.homo.src" type="image/svg+xml" />
        </q-icon>
      </div>
    </div>

    <div v-else class="flex q-gutter-x-md">
      <div v-if="word.homo.name != undefined">
        <q-btn class="bg-greys" rounded no-caps>
          <q-icon style="font-size: 100px">
            <img
              :src="`/homophone-icons/${word.homo.src}.svg`"
              type="image/svg+xml"
            />
          </q-icon>
        </q-btn>
      </div>

      <div v-if="word.homo.more !== undefined">
        <q-btn
          v-for="(m, i) in word.homo.more"
          :key="i"
          class="bg-greys"
          rounded
          no-caps
        >
          <q-icon style="font-size: 100px">
            <img
              :src="`/homophone-icons/${word.homo.more[i].src}.svg`"
              type="image/svg+xml"
            />
          </q-icon>
        </q-btn>
      </div>
      <q-tooltip>HOMOPHONE</q-tooltip>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "homopone-alert",
  props: {
    word: { required: true },
    mini: { default: false },
    floating: { default: true },
  },

  data() {
    return {
      //
    };
  },
  mounted() {
    //
  },
  methods: {
    //
  },
});
</script>
