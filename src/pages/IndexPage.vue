<template>
  <q-page class="flex flex-center">
    <div
      v-if="
        accounts.currentUser != null &&
        accounts.currentUser.userId !== 'unauthorized' &&
        accounts.userPrompts == null
      "
      class="column q-gutter-y-sm"
    >
      <q-btn @click="dashboard()">Dashboard (current)</q-btn>
      <!-- <q-btn @click="dashboardNew()">Dashboard (sample)</q-btn> -->
      <q-btn @click="dashboardSupa()"
        >Dashboard 2.1 (supabase... upcoming version)</q-btn
      >
      <q-btn @click="gotoPhonemes()">Phonemes</q-btn>

      <AuthSupa></AuthSupa>
      <!-- <SupaAccount></SupaAccount> -->
    </div>

    <div v-else class="">Index Page..</div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";

import AuthSupa from "src/components/supabase/AuthSupa.vue";
// import SupaAccount from "src/components/supabase/SupaAccount.vue";

export default defineComponent({
  name: "IndexPage",
  components: {
    AuthSupa,
    // SupaAccount,
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
    };
  },
  data() {
    return {
      //
    };
  },
  mounted() {
    // this.$q.dark.set(true);
  },
  methods: {
    dashboard() {
      this.$router.push("/master-overview");
    },
    dashboardNew() {
      this.$router.push("/master-2");
    },

    dashboardSupa() {
      this.$router.push("/master-supa");
    },
    gotoPhonemes() {
      this.$router.push("/phonemes");
    },
  },
});
</script>
