<template>
  <div>
    <!-- <div class="counter-"></div> -->

    <!-- <q-btn @click="makeSqueeze">t</q-btn> -->

    <div class="flex row">
      <div class="absolute invisible text-h5 z-max" ref="letter-size">
        {{ letters }}
      </div>
      <div class="show_borders" style="position: relative; overflow: hidden">
        <div :key="squeeze_key" class="letters-squeeze">
          <div
            class="invisible text-h5 move-window q-mx-sm"
            ref="max-letter-size"
          >
            {{
              options.reduce(function (a, b) {
                return a.length > b.length ? a : b;
              })
            }}
          </div>
        </div>
        <div class="move-letters-outer column text-h5" style="top: 0px">
          <span v-for="(l, i) in options" :key="i" class="move-letters">
            {{ l }}
          </span>
          <span class="move-letters">
            <!-- {{ options[0] }} -->
            {{ letters }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

// import PHONEMES from "/src/components/icons/phonemes.js";
// const phonemes = PHONEMES.list;

export default defineComponent({
  name: "next-unit",
  components: {},
  props: {
    options: { required: true },
    letters: { required: true },
  },
  setup() {
    return {
      // phonemes,
    };
  },
  data() {
    return {
      pattern: [],
      test: 0,
      // test2: ["t", "tt", "pt", "t"],
      test2: ["t", "tt", "t"],
      test3: "'pt'",
      color: "blue",
      shift: "-300%",
      from_width: "100px",
      to_width: "140px",
      squeeze_speed: "0.5s",
      squeeze_key: 0,
      done: false,
    };
  },
  mounted() {
    this.shift = -(this.options.length * 100 - 0) + "%";

    let vm = this;
    // window.setTimeout(function () {
    //   // vm.makeSqueeze();
    //   vm.to_width = vm.$refs["max-letter-size"].offsetWidth + "px";
    //   vm.from_width = vm.$refs["letter-size"].offsetWidth + "px";
    //   // console.log("from_width", vm.from_width);
    //   vm.done = true;
    // }, 1000);

    // this.makeSqueeze();
  },
  methods: {
    makeSqueeze() {
      this.$nextTick(function () {
        this.from_width = this.$refs["max-letter-size"].offsetWidth + "px";
        this.to_width = this.$refs["letter-size"].offsetWidth + "px";

        // console.log("from_width", this.$refs["letter-size"].offsetWidth);
        console.log("from_width", this.from_width);
        console.log("to_width", this.to_width);
        this.squeeze_key++;
      });
    },

    testM(index) {
      // document.getElementById("letter-t").offsetWidth + "px";

      // console.log(document.getElementById("letter-t").offsetWidth);
      return this.test2.map((e) => `'${e}'`)[index];
    },
  },
});
</script>

<style>
.counter-::after {
  font: 800 40px system-ui;
  content: counter(count);
  color: v-bind(color);
  animation: counter 5s linear infinite;
  counter-reset: count v-bind(test);
}

@keyframes counter {
  0% {
    /* counter-increment: count v-bind(test); */
    counter-increment: count v-bind(test);
    content: v-bind(testM(0));
  }
  10% {
    counter-increment: count 1;
  }
  20% {
    counter-increment: count 2;
  }
  30% {
    counter-increment: count 3;
  }
  40% {
    counter-increment: count 4;
  }
  50% {
    counter-increment: count 5;
  }
  60% {
    counter-increment: count 6;
  }
  70% {
    counter-increment: count 7;
  }
  80% {
    counter-increment: count 8;
  }
  90% {
    counter-increment: count 9;
  }
  100% {
    counter-increment: count 10;
  }
}

.move-letters-outer {
  position: absolute;
  overflow-x: hidden;
}
.move-letters {
  animation: moveUp 10s ease-in-out;
  animation-fill-mode: forwards;
  animation-direction: forwards;
}

@keyframes moveUp {
  0% {
    transform: translateY(0px);
    animation-timing-function: ease-in-out;
  }

  100% {
    transform: translateY(v-bind(shift));
    animation-timing-function: ease-in-out;
  }
}

.move-window {
  display: inline-block;
}

@keyframes squeeze1 {
  from {
    min-width: v-bind(from_width) !important;
    max-width: v-bind(from_width) !important;
  }
  to {
    min-width: v-bind(to_width) !important;
    max-width: v-bind(to_width) !important;
  }
}
</style>
<!-- animation-duration: v-bind(squeeze_speed);
animation-timing-function: ease-in-out;
animation-direction: forwards;
animation-fill-mode: backwards; -->
<!-- .move-window::after {
  content: "";
} -->
