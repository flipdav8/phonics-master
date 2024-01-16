<template>
  <div class="q-pa-none q-ma-none">
    <q-layout view="hHh Lpr lff" container class="shadow-2 rounded-borders">
      <q-header elevated class="bg-transparent">
        <q-toolbar>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
          <q-toolbar-title>{{ accounts.currentUser.name }}</q-toolbar-title>
          <q-btn no-caps flat label="Logout" @click="logout()"></q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="200"
        :breakpoint="500"
        bordered
      >
        <q-scroll-area class="fit">
          <q-list>
            <template v-for="(menuItem, index) in menuList" :key="index">
              <q-item
                clickable
                :active="menuItem.label === active"
                v-ripple
                @click="active = menuItem.label"
              >
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ menuItem.label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          <p v-for="n in 3" :key="n">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit nihil
            praesentium molestias a adipisci, dolore vitae odit, quidem
            consequatur optio voluptates asperiores pariatur eos numquam rerum
            delectus commodi perferendis voluptate?
          </p>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { ref } from "vue";

import { useAccountsStore } from "src/stores/accounts";

const menuList = [
  {
    icon: "settings",
    label: "General",
    separator: false,
  },
  {
    icon: "inbox",
    label: "Inbox",
    separator: false,
  },

  {
    icon: "dashboard",
    label: "Resources",
    separator: false,
  },

  {
    icon: "lock",
    label: "Security",
    separator: false,
  },
  {
    icon: "info_outline",
    label: "Help & about",
    separator: false,
  },
];

export default {
  setup() {
    const accounts = useAccountsStore();
    return {
      drawer: ref(false),
      menuList,
      accounts,
    };
  },

  data() {
    return {
      active: "Security",
    };
  },

  methods: {
    //
  },
};
</script>
