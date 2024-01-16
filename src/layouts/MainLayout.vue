<template>
  <q-layout view="lHh Lpr lFf">
    <q-header flat>
      <q-toolbar class="text-black bg-g">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <div id="extra"></div>
        <!-- <q-toolbar-title>Phonics Demo </q-toolbar-title> -->
        <q-space></q-space>
        <div id="extra_right"></div>

        <!-- <StudentChip v-if="accounts.view_student !== null"></StudentChip> -->

        <q-btn
          flat
          dense
          round
          icon="person"
          aria-label="account"
          @click="accounts.showDialog = !accounts.showDialog"
          no-caps
        >
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-g flex column justify-between no-wrap"
    >
      <q-list>
        <!-- <q-item-label header class="text-black"> Phonics LOGO </q-item-label> -->

        <q-item clickable to="/" active-class="bg-blue-2">
          <q-item-section avatar>
            <q-icon name="mdi-view-dashboard-variant-outline" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <DexieLogin class="hidden"></DexieLogin>
    <q-page-container>
      <q-dialog v-model="accounts.showDialog">
        <q-card class="q-pa-md">
          <DexieLogin></DexieLogin>
        </q-card>
      </q-dialog>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAccountsStore } from "src/stores/accounts";

import DexieLogin from "src/components/dexie/DexieLogin.vue";
// import StudentChip from "src/components/students/StudentChip.vue";

const linksList = [
  {
    title: "Home",
    caption: "Home Page",
    icon: "home",
    link: "/",
    target: "", //_blank
  },

  // {
  //   title: "Lessons",
  //   disable: true,
  //   caption: "Lessons",
  //   icon: "school",
  //   link: "/lessons",
  //   target: "", //_blank
  // },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    // EssentialLink,
    DexieLogin,
    // StudentChip,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const accounts = useAccountsStore();

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      accounts,
    };
  },
  mounted() {
    // this.$q.dark.set(true);
    // console.log("this", this.$route.path);
    // this.checkViewAs();
    // this.checkMode();
  },

  methods: {
    checkViewAs() {
      let view_as = localStorage.getItem("view_as");
      if (view_as != undefined) {
        view_as = JSON.parse(view_as);
        // console.log("view as", view_as);
        //load..
      }
    },

    checkMode() {
      let classroom_mode = localStorage.getItem("classroom_mode");
      // console.log("classroom_mode", classroom_mode);
      if (classroom_mode === "true") {
        this.accounts.classroom_mode = true;
      }
    },

    openSite(site) {
      return;
      let url;
      if (site === "home") {
        url = "https://www.reasontools.com";
      } else if (site === "facebook") {
        url = "https://www.facebook.com/reasontools";
      } else if (site === "instagram") {
        url = "https://www.instagram.com/reasontools";
      } else if (site === "twitter") {
        url = "https://www.twitter.com/reasontools";
      } else if (site === "linkedin") {
        url = "https://www.linkedin.com/company/reasontools";
      } else if (site === "patreon") {
        url = "https://www.patreon.com/reasontools";
      }
      if (url != undefined) {
        window.open(url, "_blank").focus();
      }
    },

    goToTerms() {
      this.$router.push("/terms");
    },

    goToPrivacy() {
      this.$router.push("/privacy");
    },
  },
});
</script>
<style>
.rounded-corners-10 {
  border-radius: 10px;
}
.rounded-corners-20 {
  border-radius: 20px;
}

.border-l {
  border-left: solid 3px green;
}

.show_border {
  border: solid 1px green;
}

.bg-texture-2 {
  background: radial-gradient(
        1.5em 6.28571em at 1.95em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.25) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      0 0,
    radial-gradient(
        1.5em 6.28571em at -0.45em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.25) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      1.5em 5.5em,
    radial-gradient(
        2.3em 4.57143em at 2.99em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.3) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      0 0,
    radial-gradient(
        2.3em 4.57143em at -0.69em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.3) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      2.3em 4em,
    radial-gradient(
        3.5em 6.28571em at 4.55em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.25) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      0 0,
    radial-gradient(
        3.5em 6.28571em at -1.05em,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.25) 55%,
        rgba(255, 255, 255, 0) 55%
      )
      3.5em 5.5em,
    radial-gradient(#15ffa5, #00ced1);
  background-color: mediumspringgreen;
  background-size: 1.5em 11em, 1.5em 11em, 2.3em 8em, 2.3em 8em, 3.5em 11em,
    3.5em 11em, 100% 100%;
  background-repeat: repeat;
}

.bg-texture-3 {
  color: #333;
  background: repeating-linear-gradient(
        90deg,
        #f0f0f0 0,
        #f0f0f0 5%,
        transparent 0,
        transparent 50%
      )
      0 / 15px 15px,
    repeating-linear-gradient(
        180deg,
        #f0f0f0 0,
        #f0f0f0 5%,
        transparent 0,
        transparent 50%
      )
      0 / 15px 15px;
}

.bg-texture-1 {
  background: repeating-linear-gradient(
      -45deg,
      #a1d8f4 0,
      #a1d8f4 25%,
      #8ccae9 0,
      #8ccae9 38%
    )
    0 / 20px 20px;
}

.bg-g {
  background: linear-gradient(
    -20deg,
    #ffffff,
    #ffe4e9,
    #fcc8e2,
    #f6baed,
    #efb0ff,
    #d3a2ff,
    #d5f9ff
  );
  background-size: 400% 400%;
}
</style>
