<template>
  <div
    class="flex flex-center column fit justify-center align-center content-center"
  >
    <div
      v-if="
        (currentUser &&
          currentUser.userId !== 'unauthorized' &&
          userPrompts == null) ||
        (currentUser && currentUser.name.split('@')[1] === 'demo.local')
      "
    >
      <!-- <SubscribeBanner
        v-if="
          !hide_banner &&
          (accountStore.subscription === null ||
            accountStore.subscription.status !== 'active')
        "
        :allow_hide="true"
        :manage="true"
        @hide="hide_banner = true"
      >
      </SubscribeBanner> -->

      <q-card style="max-width: 500px" flat>
        <q-card-section class="text-center">
          <q-option-group
            v-model="accountStore.userType"
            :options="accountStore.useTypeOptions"
            color="primary"
            inline
          />
        </q-card-section>

        <q-card-section>
          <q-banner
            v-if="currentUser.isLoggedIn"
            rounded
            class="bg-green text-white q-mt-md text-center"
          >
            Logged in as {{ currentUser.email }}
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Logout" @click="logout()"></q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <div v-else class="text-h4">Login/Register</div>

    <q-card
      v-if="
        userPrompts &&
        currentUser &&
        currentUser.name.split('@')[1] !== 'demo.local'
      "
      style="max-width: 500px"
      class="q-ma-md q-pa-md"
      flat
    >
      <q-card-section>
        <q-input
          v-if="userPrompts.type === 'email'"
          type="text"
          v-model="email"
          outlined
        >
          <template #before> Email:</template>
        </q-input>

        <q-input
          v-if="userPrompts.type === 'otp'"
          type="text"
          v-model="otp"
          outlined
          placeholder="Enter OTP here"
        >
          <template #before> OTP:</template>
        </q-input>

        <q-banner
          v-for="(alert, i) in userPrompts.alerts"
          :key="i"
          rounded
          :class="
            alert.type === 'info'
              ? 'bg-primary text-white q-mt-md'
              : 'bg-red text-white q-mt-md'
          "
        >
          <span v-if="userPrompts.alerts[i].messageCode === 'OTP_SENT'">
            A One-Time password has been sent to
            {{ userPrompts.alerts[i].messageParams.email }} from
            <strong>Dexie Cloud</strong>
          </span>
          <span v-else> {{ userPrompts.alerts[i].message }}</span>
        </q-banner>
      </q-card-section>

      <q-card-actions align="center">
        <div v-if="userPrompts.type === 'email'">
          <q-btn
            flat
            no-caps
            label="Submit"
            @click="
              userPrompts.onSubmit({
                email: this.email,
                grant_type: 'demo',
              })
            "
          ></q-btn>
          <!-- <q-btn no-caps @click="loginDemo()" label="Demo login"></q-btn> -->
        </div>
        <div v-if="userPrompts.type === 'otp'">
          <!-- <q-btn no-caps label="Cancel" @click="userPrompts.onCancel()"></q-btn> -->
          <q-btn
            no-caps
            label="Submit"
            @click="
              userPrompts.onSubmit({
                otp: this.otp,
              })
            "
          ></q-btn>
        </div>
        <!-- <q-btn no-caps label="Enter OTP" @click="verifyOTP()"></q-btn> -->
      </q-card-actions>
    </q-card>

    <q-card
      v-else-if="currentUser && currentUser.userId == 'unauthorized'"
      style="max-width: 500px"
      class="q-ma-xl"
      flat
    >
      Processing request..
    </q-card>

    <!-- <div
      style="max-width: 500px"
      v-if="currentUser && currentUser.userId == 'unauthorized'"
    >
      <q-btn label="login guest" @click="loginGuest()"></q-btn>
    </div> -->

    <div v-if="currentUser && currentUser.name.split('@')[1] === 'demo.local'">
      guest: {{ currentUser.name }}
      <q-btn no-caps label="Logout Guest" @click="logout()"></q-btn>
      <!-- Realms: {{ realms }} -->
      <q-btn @click="createRealm()" label="Create Realm"></q-btn>
      <q-btn @click="testAddGuest()" label="Test Add as Guest"></q-btn>
      <p
        style="max-width: 500px"
        v-for="(network, index) in accountStore.networks"
        :key="index"
      >
        {{ network }}
      </p>
    </div>

    <div class="q-mt-md hidden">
      <p>userPrompts: {{ accountStore.userPrompts }}</p>
      <p>Websocket: {{ accountStore.socketStatus }}</p>
      <p>Sync: {{ accountStore.syncState }}</p>
      <p>Invites: {{ accountStore.invites }}</p>
      <p>Roles: {{ accountStore.roles }}</p>
      <q-btn @click="test()" label="Test (add)" no-caps></q-btn>
      <q-btn @click="readTest()" label="Read Test " no-caps></q-btn>
    </div>
  </div>
</template>

<script>
import { liveQuery } from "dexie";
import { setupSync } from "src/database/dbCloud";
import { useObservable, from } from "@vueuse/rxjs";
import { useAccountsStore } from "src/stores/accounts";

// import { getTiedRealmId } from "dexie-cloud-addon";
import { date } from "quasar";

// import SubscribeBanner from "src/components/subscription/SubscribeBanner.vue";

export default {
  props: {},
  components: {
    // SubscribeBanner
  },
  setup() {
    const accountStore = useAccountsStore();

    return {
      accountStore,
      date,
    };
  },
  mounted() {
    console.log("mounted");
    this.setup();
  },
  data() {
    return {
      show_login: false,
      otp: "",
      email: "",
      //
      realms: [],
      userPrompts: null,
      currentUser: null,
      syncdb: null,
      hide_banner: false,
    };
  },
  computed: {
    cancelDate() {
      let format = "YYYY-MM-DDTHH:mm:ss.SSSZ";

      if (this.accountStore.subscription.cancel_info === undefined)
        return { diff: "", on: "" };
      let unix_timestamp = this.accountStore.subscription.cancel_info.cancel_at;

      // let unix_timestamp = 1735274860;
      let date1 = date.formatDate(Date.now(), format);
      let date2 = date.formatDate(unix_timestamp * 1000, format);
      let diff = date.getDateDiff(date2, date1, "days");
      let ondate = date.formatDate(unix_timestamp * 1000, "Do of MMMM YYYY");
      return { diff: diff, on: ondate };
    },
  },

  methods: {
    async setup() {
      if (this.accountStore.syncdb == null) {
        this.syncdb = await setupSync();
      } else {
        this.syncdb = this.accountStore.syncdb;
      }

      this.syncdb.cloud.login();
      this.currentUser = useObservable(this.syncdb.cloud.currentUser);
      this.userPrompts = useObservable(this.syncdb.cloud.userInteraction);
      // console.log("subscription", this.accountStore.subscription);
    },

    login() {
      this.syncdb.cloud.login();
      // this.syncdb.cloud.login({ grant_type: "demo", "alice@demo.local": {} });
    },
    loginDemo() {
      this.syncdb.cloud.login({ grant_type: "demo", email: "phil@demo.local" });
    },

    async loginGuest() {
      let email = "phil@demo.local";
      try {
        console.log(this.syncdb.cloud);
        await this.syncdb.cloud.sync();

        let login = await this.syncdb.cloud.login({
          grant_type: "demo",
          email,
        });
        console.log("login", login);
      } catch (err) {
        console.log(err);
      }
    },

    async logout() {
      await this.syncdb.delete();
      window.location.reload();
    },

    test() {
      this.addTest("somename");
    },

    async createRealm() {
      // let networks = await this.syncdb.networks.toArray();
      // const realmId = getTiedRealmId(networks[0].primary_id);
      // console.log(realmId);

      let realm = await this.syncdb.realms.add({
        name: "First Realm",
        represents: "Tresting Realms",
      });

      let member = await this.syncdb.members.add({
        realmId: realm,
        userId: this.currentUser.userId,
        invite: true,
        permission: {
          add: ["*"],
          update: ["*"],
          manage: ["*"],
        },
      });
      console.log("realm", realm);
      console.log("member", member);
    },

    async testAddGuest() {
      let realmId = "rlm0ODv4_VowO9HMmu1GP0Zs|A4com";
      let owner = null;

      let id = "some id";
      try {
        const primary_id = await this.syncdb.networks.add({
          id: id,
          title: "another guest test",
          text: "another text",
          // owner: owner,
          // owner: "flipdav8@gmail.com",
          // realmId: realmId,
        });
      } catch (error) {
        console.log("status error", error);
      }
    },

    async addTest(name) {
      try {
        // Add Test
        const primary_id = await this.syncdb.test.add({
          title: name,
          text: "some text",
        });
      } catch (error) {
        let status = `Failed to add test: ${error}`;
        console.log("status error", status);
      }
    },

    async readTest() {
      try {
        //check if exists...
        // let response = await db.responses.get({ network_or_room_id: this.id });
        let records = await this.syncdb.test.toArray();
        console.log("records", records);
      } catch (error) {
        let status = `Failed to read test: ${error}`;
        console.log("status error", status);
      }
    },

    subscribeTest() {
      // prefilled_email='flipdav8'
      // let email = "flipdav8@gmail.com";
      // let email = "flipdav8@hotmail.com";
      // console.log("this.ac", this.accounts.currentUser);
      let email = this.accountStore.currentUser.email;
      window.open(
        `${process.env.STRIPE_PAYMENT_LINK}?prefilled_email=${email}`,
        "_blank"
      );
    },
  },
};
</script>
