<template>
  <div>
    <q-toggle
      name="changeTheme"
      v-model="$q.dark.mode"
      @update:model-value="toggleDark"
      checked-icon="dark_mode"
      color="grey"
      :label="$q.dark.mode ? 'Dark Mode' : 'Light Mode'"
      unchecked-icon="light_mode"
    />

    <!-- <div class="cpd-theme-light invisible mx_Username_color1"></div>
    <div class="cpd-theme-dark invisible mx_Username_color1"></div>
    <div class="hidden">
      hello cpd-theme
      <div
        :class="{
          'cpd-theme-dark': $q.dark.mode,
          'cpd-theme-light': !$q.dark.mode,
        }"
        class="mx_Username_color2"
      >
        <strong>Some color</strong>
      </div>
      <div class="cpd-theme-dark compound1 mx_Username_color3">dark</div>
      <div class="cpd-theme-light compound0 mx_Username_color3">dark</div>
    </div> -->
  </div>
  <!-- <BaseButton label="changeTheme" @click="changeTheme()"></BaseButton> -->
</template>

<script>
import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { colors, setCssVar, getCssVar } from "quasar";
const { lighten } = colors;

export default defineComponent({
  name: "BaseTheme",

  components: {},

  setup() {
    // const $q = useQuasar();
    return {
      //
    };
  },
  mounted() {
    if (localStorage.getItem("darkTheme") === "true") {
      this.$q.dark.set(true);
    } else if (localStorage.getItem("darkTheme") === "false") {
      this.$q.dark.set(false);
    } else {
      this.$q.dark.set(true);
    }

    // document.querySelector(".dark-toggle").classList.add("dark-mode");
    // this.$refs["dark-toggle"].classList.add("dark-mode");
    // setCssVar("secondary", "pink");
    // document.body.style.setProperty("--q-secondary", "#0273d4");
    // console.log("colors", getCssVar("secondary"));
    // document.body.style.setProperty("--q-secondary", "#0273d4");

    // document.documentElement.style.setProperty("--test", "#0273d4");
    // let test = getComputedStyle(document.documentElement).getPropertyValue(
    //   "--test"
    // ); // #0273d4
    // console.log("test", test);

    // let test = getComputedStyle(document.documentElement).getPropertyValue(
    //   "--cpd-font-weight-medium"
    // ); // #0273d4
    // console.log("test", test);

    //TODO: use below code later to allow system preference...
    // if (
    //   window.matchMedia &&
    //   window.matchMedia("(prefers-color-scheme: dark)").matches
    // ) {
    //   // dark mode
    //   console.log("dark mode");
    // } else {
    //   console.log("light mode");
    // }

    this.changeTheme();
  },
  data() {
    return {
      darkMode: true,
    };
  },
  computed: {
    //
  },
  methods: {
    changeTheme() {
      const newPrimaryColor = "#9cb9d6";
      const newSecondaryColor = "#0a7d71";
      setCssVar("primary", newPrimaryColor);
      setCssVar("primary-darkened", lighten(newPrimaryColor, -10));
      setCssVar("seconary", newSecondaryColor);
      setCssVar("seconary-darkened", lighten(newSecondaryColor, -10));
    },

    toggleDark() {
      this.$q.dark.toggle();
      localStorage.setItem("darkTheme", this.$q.dark.mode);

      // let classN = document.getElementsByClassName(
      //   this.$q.dark.mode ? "cpd-theme-dark" : "cpd-theme-light"
      // );
      // let test = getComputedStyle(classN[0]).getPropertyValue(
      //   "--cpd-color-fuchsia-1200"
      // );

      // console.log("test", test);
    },
  },
});
</script>

<style lang="scss">
.test {
  background-color: var(--test);
}

.border-thing {
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box; /* Firefox, other Gecko */
  box-sizing: border-box;
}

.border-r {
  border-right: solid 1px $primary;
}
.border-l {
  border-left: solid 1px $primary;
}
.border-t {
  border-top: solid 1px $primary;
}
.border-b {
  border-bottom: solid 1px $primary;
}

.border-rr {
  border-right: solid 4px $primary;
}
.border-ll {
  border-left: solid 4px $primary;
}
.border-tt {
  border-top: solid 4px $primary;
}
.border-bb {
  border-bottom: solid 4px $primary;
}

.inactive {
  opacity: 0.5;
}

.show_border {
  border: solid 1px green;
}

.r-rounded {
  border-radius: 9px;
}

/* .body--dark .q-btn {
  border: solid 1px #1d1d1d;
} */

/*

.body--light .q-toolbar {
  background: transparent;
  /* color: #000000; */

//// LIGHT MODE
$light-1: #e8e8e8; // divs
$light-2: #f5f5f3; // toolbar, card
$light-3: #cfd8dc;
$light-4: #cccccc;
$light-5: #bababa;
$misc: #d3cba6;

.body--light {
  background: $light-1;
}

.body--light .main.q-header {
  background: $light-4;
  //background: #bababa;
  color: #010101;
}

.body--light .q-header {
  background: transparent;
  color: #010101;
}

.body--light .q-drawer {
  background: $light-2;
  // color: #010101;
} // SIDE DRAWER COLOUR LIGHT

.body--light .q-tab {
  background: $light-1;
  color: #010101;
}

.body--light .q-bar {
  background: $light-4;
  // color: #010101;
}

.body--light .q-toolbar {
  background: $light-2;
}

.body--light .q-card {
  background: $light-2;
}

//// DARK MODE

.body--dark {
  background: #000;
}

.body--dark .q-header {
  background: transparent;
  // background: #1d1d1d;
}

// .body--dark .q-toolbar {
//   background: #1d1d1d;
// }

.body--dark .sep .q-separator {
  background: #1d1d1d;
}

// .body--dark .q-table {
//   background: #2f3337;
// }

.body--dark .q-tab-panel {
  background: #2f3337;
}

/* unvisited link */
.haslinks a:link {
  color: black;
}

/* visited link */
/* a:visited .haslinks {
  color: green;
} */

/* mouse over link */
.haslinks a {
  cursor: pointer;
}

.haslinks a:hover {
  color: hotpink;
}

/* selected link */
.haslinks a:active {
  color: blue;
}

.body--dark .haslinks a:link {
  color: white;
}

/* visited link */
.body--dark .haslinks a:visited {
  color: orange;
}

/* mouse over link */
.body--dark .haslinks a:hover {
  color: hotpink;
}

/* selected link */
.body--dark .haslinks a:active {
  color: blue;
}
</style>
