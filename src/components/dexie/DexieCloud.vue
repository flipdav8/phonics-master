<template>
  <div class="q-py-md">
    <div v-if="accounts.currentUser && accounts.currentUser.isLoggedIn">
      <q-banner class="bg-green q-mb-sm" rounded dense>
        {{ accounts.currentUser.name }}
        <q-btn flat no-caps dense>Logout</q-btn>
      </q-banner>
      <q-table
        title="Synced Networks"
        :rows="rows"
        :columns="columns"
        row-key="name"
        hide-bottom
        :loading="loading"
      >
        <!-- <template v-slot:body-cell="props">
        <q-td v-if="props.col.field === 'open'" :props="props"> Open.. </q-td>
        <q-td v-else :props="props"> {{ props.row }} </q-td>
      </template> -->
        <template v-slot:body-cell-open="props">
          <q-td :props="props">
            <q-btn
              v-if="props.value"
              no-caps
              dense
              flat
              color="red"
              icon="delete"
              class="q-mx-sm"
              @click="deleteNetwork(props.value)"
            ></q-btn>
            <q-btn
              v-if="props.value"
              no-caps
              dense
              @click="openNetwork(props.value)"
              >Open</q-btn
            >
          </q-td>
        </template>
      </q-table>
    </div>
    <div v-else><DexieAccount></DexieAccount></div>
  </div>
</template>

<script>
// import { db, deleteDb } from "src/database/db";

import { liveQuery } from "dexie";
import { setupSync } from "src/database/dbCloud";
import { useObservable, from } from "@vueuse/rxjs";
import { useAccountsStore } from "src/stores/accounts";
import { getTiedRealmId } from "dexie-cloud-addon";
import DexieAccount from "src/components/dexie/DexieAccount.vue";

const columns = [
  {
    label: "Title",
    field: "title",
    name: "title",
    align: "center",
    sortable: true,
  },

  {
    label: "Nodes",
    field: "nodes",
    align: "center",
    sortable: true,
  },
  {
    label: "Edges",
    field: "edges",
    name: "edges",
    align: "center",
    sortable: true,
  },
  {
    label: "",
    field: "open",
    name: "open",
    align: "center",
    sortable: true,
  },
];

export default {
  components: { DexieAccount },
  setup() {
    // const DB = syncdb;
    const accounts = useAccountsStore();
    return {
      columns,
      accounts,
    };
  },
  data() {
    return {
      rows: [],
      DB: null,
      loading: true,
    };
  },
  mounted() {
    this.setup();
    this.getSyncedNetworks();
  },
  methods: {
    setup() {
      if (this.accounts.syncdb == null) {
        setupSync();
      }

      this.DB = this.accounts.syncdb;
    },
    async getSyncedNetworks() {
      try {
        let records = await this.DB.networks.toArray();
        let vm = this;
        records.forEach(function (item) {
          // vm.rows.push(item);
          vm.nodeEdgeCount(item);
          vm.rows.push({ ...item, ...{ open: item.primary_id } });
        });
        this.loading = false;
      } catch (error) {
        let status = `Failed to load networks: ${error}`;
        console.log("status error", status);
      }
    },

    async nodeEdgeCount(item) {
      let node_count = await this.DB.nodes
        .where({ network_id: item.id })
        .count();
      let row = this.rows.find((e) => e.id === item.id);
      row["nodes"] = node_count;
      let edge_count = await this.DB.edges
        .where({ network_id: item.id })
        .count();
      row["edges"] = edge_count;
    },

    openNetwork(primary_id) {
      this.$router.push(`/sync/${primary_id}`);
    },

    async deleteNetwork(primary_id) {
      var result = confirm("Are you sure you want to delete this network?");
      if (result) {
        //Logic to delete the item
        this.DB.networks.delete(primary_id);
        let rowIndex = this.rows.findIndex((e) => e.primary_id === primary_id);
        this.rows.splice(rowIndex, 1);
      }
    },
  },
};
</script>
