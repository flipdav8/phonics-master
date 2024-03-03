<template>
  <div class="fit show_borders">
    <div v-if="mode === 'current'" class="fit">
      <span v-if="pattern.selected != null">
        <span v-if="pattern.selected.includes('^')" class="phonics-icon-outer">
          <q-icon name="mdi-ghost-outline"></q-icon>
        </span>
        <span v-else>
          <span
            v-if="
              pattern.selected.includes('-') && split_end.length > 0 && squeeze
            "
            class="phonics-split-extra"
          >
            <span>{{ pattern.selected.split("-")[0] }}</span>
            <span
              style="position: relative; animation-duration: 8s"
              class="fit animated"
              :class="{ fadeOut: !pattern.last, 'text-whites': pattern.last }"
            >
              <span class="invisible">{{ pattern.next }}</span>
              <div class="absolute-full flex content-center justify-center">
                -
              </div>
            </span>
            <span>{{ pattern.selected.split("-")[1] }}</span>
          </span>
          <span v-else> {{ pattern.selected }}</span>
        </span>
      </span>
      <div v-else class="phonics-icon-outer">
        <div v-if="pattern.icon != null" class="phonics-icon-outer">
          <span v-if="pattern.icon.icon_name != undefined">
            <component
              :is="pattern.icon.icon_name"
              color="'#69cde4'"
              :label="false"
              :dots="false"
              :center="true"
              :scale="true"
              style="border: solid 0px white; border-radius: 10px"
              class="overflow-hidden"
            ></component>
          </span>
          <q-icon
            v-else-if="pattern.icon.src === undefined"
            :name="pattern.icon"
          ></q-icon>
          <span v-else> ... </span>
        </div>
      </div>
    </div>

    <div v-if="mode === 'past' && correct !== 'corrected'" class="fit">
      <span v-if="pattern.old_letters != null">
        <span
          v-if="pattern.old_letters.includes('^')"
          class="phonics-icon-outer"
        >
          <q-icon name="mdi-ghost-outline"></q-icon>
        </span>
        <span v-else>
          <span
            v-if="
              pattern.old_letters.includes('-') &&
              split_end.length > 0 &&
              squeeze
            "
            class="phonics-split-extra"
          >
            <span>{{ pattern.old_letters.split("-")[0] }}</span>
            <span style="position: relative" class="fit">
              <span class="invisible">{{ pattern.next }}</span>
              <div class="absolute-full flex content-center justify-center">
                -
              </div>
            </span>
            <span>{{ pattern.old_letters.split("-")[1] }}</span>
          </span>
          <span v-else> {{ pattern.old_letters }}</span>
        </span>
      </span>
      <span v-else-if="pattern.selected == null"></span>
      <span v-else class="phonics-icon-outer">
        <!-- <q-icon :name="pattern.icon"> </q-icon> -->
        <div v-if="pattern.icon != null" class="phonics-icon-outer">
          <span v-if="pattern.icon.icon_name != undefined">
            <component
              :is="pattern.icon.icon_name"
              color="'#69cde4'"
              :label="false"
              :dots="false"
              :center="true"
              :scale="true"
              style="border: solid 0px white; border-radius: 10px"
              class="overflow-hidden"
            ></component>
          </span>
          <q-icon
            v-else-if="pattern.icon.src === undefined"
            :name="pattern.icon"
          ></q-icon>
          <span v-else> ... </span>
        </div>
      </span>
    </div>

    <div v-if="mode === 'hidden'" class="fit">
      <span v-if="pattern.selected != null">
        <span
          v-if="
            pattern.selected.includes('-') && split_end.length > 0 && squeeze
          "
        >
          {{ pattern.selected.split("-")[0] }}
        </span>
        <span
          v-else-if="pattern.selected.includes('^')"
          class="phonics-icon-outer"
        >
          <q-icon name="mdi-ghost-outline"></q-icon>
        </span>
        <span v-else> {{ pattern.selected }}</span>
      </span>
      <span v-else class="phonics-icon-outer">
        <!-- <q-icon :name="pattern.icon"></q-icon> -->
        <div v-if="pattern.icon != null" class="phonics-icon-outer">
          <span v-if="pattern.icon.icon_name != undefined">
            <component
              :is="pattern.icon.icon_name"
              color="'#69cde4'"
              :label="false"
              :dots="false"
              :center="true"
              :scale="true"
              style="border: solid 0px white; border-radius: 10px"
              class="overflow-hidden"
            ></component>
          </span>
          <q-icon
            v-else-if="pattern.icon.src === undefined"
            :name="pattern.icon"
          ></q-icon>
          <span v-else> ... </span>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "word-letters",
  components: {
    // PhonicOptions
  },
  props: {
    mode: { required: true },
    pattern: { required: true },
    correct: { required: true },
    split_end: {},
    squeeze: { default: true },
  },
  data() {
    return {
      mounted: false,
    };
  },
  mounted() {
    this.mounted = true;
  },

  computed: {
    //
  },

  methods: {
    //
  },
});
</script>
<style>
.phonics-split-extra {
  white-space: nowrap;
}
</style>
