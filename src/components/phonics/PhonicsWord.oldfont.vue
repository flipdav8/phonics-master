<template>
  <div class="fit">
    <div class="fit hidden">
      <div
        class="flex row phonics-word fit justify-center items-center normal-word"
      >
        <div>
          <div>t</div>
        </div>
        <div class="floating">
          <div class="phonic-input flex">
            <!-- <div>
            <q-icon>
              <img src="~assets/phonic-icons/balloon-dots.svg" />
            </q-icon>
          </div> -->
            <!-- <div>e</div> -->
            <div class="word-letters-2 flex column">ea</div>
            <!-- <div class="word-letters-3">eas</div> -->
            <!-- <div class="word-letters-4">ough</div> -->
          </div>
        </div>

        <div>s</div>
        <div>t</div>
      </div>

      <div
        class="flex row phonics-word fit justify-center items-center long-word hidden"
      >
        <div>b</div>
        <div class="phonic-input">
          <!-- <div>
          <q-icon>
            <img src="~assets/phonic-icons/balloon-dots.svg" />
          </q-icon>
        </div> -->
          <div>a</div>
          <!-- <div class="word-letters-2">ea</div> -->
          <!-- <div class="word-letters-3">eas</div> -->
          <!-- <div class="word-letters-4">ough</div> -->
        </div>
        <div>c</div>
        <div>k</div>
        <div>p</div>
        <div>r</div>
        <div>e</div>
        <div>s</div>
        <div>s</div>
        <div>u</div>
        <div>r</div>
        <div>e</div>
      </div>
    </div>
    <Teleport to="#extra_right">
      <div class="flex row items-center q-gutter-md">
        <Homophone
          v-if="word.homo !== null"
          :word="word"
          :mini="true"
        ></Homophone>
        <div class="text-h5" style="top: 25px; right: 10px">
          <div v-if="look_at_data !== undefined">
            <div v-if="look_at_data.track[word.id] !== undefined">
              <div v-if="look_at_data.track[word.id] < 0">0 / {{ target }}</div>
              <div v-else>{{ look_at_data.track[word.id] }} / {{ target }}</div>
            </div>
            <div v-else>0 / {{ target }}</div>
          </div>
        </div>
      </div>
    </Teleport>

    <Transition
      v-show="enter"
      appear
      :key="'t' + next_key"
      style="animation-duration: 3s"
      enter-active-class="animate  slideInRight"
      leave-active-class="animate slideOutLeft"
      class="fit"
    >
      <div style="position: relative">
        <div v-if="mode === 'testing'">
          <PhonicWordSound
            ref="word"
            v-if="word.type === 'sound'"
            class="fit"
            :word="word"
            :key="word.id + next_key"
            :blocks="blocks"
            @next="next()"
            @isCorrect="isCorrect"
            @isIncorrect="isIncorrect"
            @changed="changed = true"
          >
            <!-- <template v-slot:homo>
              <div class="flex row q-gutter-md">
                <Homophone v-if="word.homo !== null" :word="word"></Homophone>
              </div>
            </template> -->
          </PhonicWordSound>

          <PhonicWordSpelling
            ref="word"
            v-if="word.type === 'spelling'"
            class="fit"
            :word="word"
            :key="word.id + next_key"
            :blocks="blocks"
            @next="next()"
            @isCorrect="isCorrect"
            @isIncorrect="isIncorrect"
            @changed="changed = true"
          >
          </PhonicWordSpelling>
        </div>
        <!-- HELPING MODE WORDs -->
        <div v-if="mode === 'helping'">
          <PhonicHelp
            ref="word"
            class="q-px-sm"
            style="margin-top: 80px"
            :key="word.id + next_key"
            :word="word"
            @next="next()"
            @isCorrect="isCorrect"
            @isIncorrect="isIncorrect"
            @changed="changed = true"
          ></PhonicHelp>
        </div>

        <div
          v-if="!$q.platform.is.mobile"
          class="absolute"
          style="top: 100%; right: 10%"
        >
          <div class="flex row q-gutter-md">
            <Homophone v-if="word.homo !== null" :word="word"></Homophone>
          </div>
        </div>
      </div>
    </Transition>

    <div
      v-if="$q.platform.is.mobile"
      class="absolute"
      style="top: 10px; right: 10px"
    >
      <div class="flex row q-gutter-md">
        <Homophone
          v-if="word.homo !== null"
          :word="word"
          :floating="false"
        ></Homophone>
      </div>
    </div>

    <div
      :class="{ absolute: !preview_mode ? true : false }"
      class="full-width flex justify-end z-top hiddens"
      style="bottom: 10px; right: 10px"
    >
      <!-- <q-btn no-caps flat style="font-size: 50px">
      <q-icon name="mdi-arrow-left-circle"></q-icon>
    </q-btn> -->

      <q-btn
        @click="continueWords()"
        class="bg-blue-3"
        rounded
        no-caps
        flat
        size="xl"
      >
        <q-icon name="mdi-arrow-right-circle"></q-icon>
        <q-tooltip>Submit Word</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import PhonicWordSound from "./words/PhonicWordSound.vue";
import PhonicWordSpelling from "./words/PhonicWordSpelling.vue";
import PhonicHelp from "./words/PhonicHelp.vue";
import Homophone from "./words/Homophone.vue";

export default defineComponent({
  name: "phonics-word",
  components: {
    PhonicWordSound,
    PhonicWordSpelling,
    PhonicHelp,
    Homophone,
  },
  props: {
    word: { required: true },
    blocks: { required: true },
    mode: { required: true },
    look_at_data: {},
    target: {},
    preview_mode: { default: false },
  },
  data() {
    return {
      mounted: false,
      next_key: 0,
      changed: false,
      enter: true,
      button_margin: "2%",
    };
  },
  mounted() {
    // console.log("mounted word");
    this.mounted = true;
  },
  computed: {
    //
  },
  methods: {
    next() {
      let vm = this;
      this.enter = false;
      // return;
      window.setTimeout(function () {
        vm.$emit("next");
        vm.next_key++;
      }, 2000);
    },

    isCorrect(e) {
      this.$emit("isCorrect", e);
    },
    isIncorrect(e) {
      this.$emit("isIncorrect", e);
    },
    continueWords() {
      // this.next();
      // return;
      this.$refs.word.checkWord(); //will trigger next()
      this.changed = false;
    },
  },
});
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Mulish:wght@200;500&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Mulish:wght@200;500&family=Salsa&display=swap");

/*Spelling */

/* .gothic {
  font-family: century-gothic, sans-serif;
  font-weight: 400;
  font-style: normal;
} */

.phonic-input-icon {
  border-radius: 15%;
  box-shadow: inset 0 0 50px #72bcf7;
}

.phonic-input-general {
  border-radius: 15%;
  box-shadow: inset 0 0 50px #72bcf7;
  padding: 20px;
  margin: 10px;
}

.phonic-input-general.phonic-selected {
  box-shadow: inset 0 0 50px #72bcf7;
  animation: colorIn 1s linear;
  border: solid 2px;
  background: #72bcf7;
}

@keyframes colorIn {
  from {
    background: transparent;
  }
  to {
    background: #72bcf7;
  }
}

/*end of Spelling */

/*sound */
.phonics-word {
  container-type: inline-size;
}

.phonics-word div {
  display: inline-block;
  /*font-family: "Mulish";*/
}

.phonics-help-card {
  border-radius: 15px;
  box-shadow: inset 0 0 50px white;
  padding: 20px;
}

.phonics-word .phonic-input {
  border-radius: 15%;
  box-shadow: inset 0 0 50px #72bcf7;
  padding: 0%;
  margin: 0%;
  /*width: 20vw; */
  /*height: 20vw; */
  text-align: center;
  text-justify: center;
  cursor: pointer;
  position: relative;
  background: transparent;
  z-index: 1;
  overflow: hidden;
  text-align: center;
  text-justify: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/*position: relative; */

.phonic-input div {
  text-align: center;
  text-justify: center;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
}

.word-letters-1 {
  font-size: 100%;
}

.word-letters-2 {
  transform: scale(0.8) translateY(0%);
  white-space: nowrap;
}
/*10, 20 40,*/

.word-letters-3 {
  transform: scale(0.6) translateY(0%);
  white-space: nowrap;
}

.word-letters-4 {
  transform: scale(0.4) translateY(0%);
  white-space: nowrap;
}

/* Small Screen Width  */
@media only screen and (min-width: 200px) and (max-width: 600px) {
  /* Normal Size Word 1- 5  */
  .phonics-word.normal-word .phonic-input {
    width: 33vw;
    height: 33vw;
  }

  .phonics-big-text,
  .phonics-word.normal-word {
    font-size: 30vw;
  }

  /* Long Size Word 5-12  */
  .phonics-word.long-word .phonic-input {
    width: 15vw;
    height: 15vw;
  }

  .phonics-help,
  .phonics-normal-text,
  .phonics-word.long-word {
    font-size: 12vw;
  }
}

/* >Medium Screen Width  */
@media only screen and (min-width: 600px) {
  /* Normal Size Word 1- 5  */
  .phonics-word.normal-word .phonic-input {
    width: 23vw;
    height: 23vw;
  }

  .phonics-big-text,
  .phonics-word.normal-word {
    font-size: 20vw;
  }

  /* Long Size Word 5-12  */
  .phonics-word.long-word .phonic-input {
    width: 10vw;
    height: 10vw;
  }

  .phonics-help,
  .phonics-normal-text,
  .phonics-word.long-word {
    font-size: 8vw;
  }
}

.floating-no-margin {
  position: relative;
  transform: translateY(0);
  transition: transform 1s;
}

.floating {
  position: relative;
  transform: translateY(0);
  transition: transform 1s;
  margin: v-bind(button_margin);
}

.floating-no-margin:after,
.floating::after {
  content: "";
  display: block;
  position: absolute;
  bottom: -30px;
  left: 50%;
  height: 30px;
  width: 110%;
  box-shadow: 0px 0px 0px 0px #72bcf7;
  border-radius: 50%;
  background-color: rgba(0, 0, 100, 0.05);
  transform: translate(-50%, 40px);
  transition: transform 1s;
}

/* Hover States
.floating:hover {
  transform: translateY(-40px);
  transition: transform 1s;
} */
.floating:hover:after {
  transform: translate(-50%, 40px) scale(1.15);
  transition: transform 1s;
}

.avatar-wobble {
  border-radius: 250px 750px 250px 750px / 750px 250px 750px 250px;
  animation: wobble 2s ease-in-out alternate infinite;
}

@keyframes wobble {
  50% {
    border-radius: 15%;
    box-shadow: inset 0 0 50px #72bcf7;
    overflow: hidden;
    cursor: pointer;
    font-size: 40pxs;
  }
  100% {
    border-radius: 0%;
    box-shadow: none;
    overflow: unset;
    cursor: unset;
    font-size: 10px;
  }
}
</style>
