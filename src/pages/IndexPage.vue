<template>
  <q-page class="flex flex-center">
    <div
      v-if="
        accounts.currentUser != null &&
        accounts.currentUser.userId !== 'unauthorized' &&
        accounts.userPrompts == null
      "
    >
      <q-btn @click="dashboard()">Dashboard</q-btn>
      <q-btn @click="dashboardNew()">Dashboard 2.0</q-btn>
    </div>

    <div v-else class="">Index Page..</div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";

export default defineComponent({
  name: "IndexPage",
  components: {
    //
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
  },
});
</script>
