import Dexie from 'dexie';
import dexieCloud from "dexie-cloud-addon";

// import {
//   applyEncryptionMiddleware,
//   NON_INDEXED_FIELDS,
//   clearEncryptedTables
// } from 'dexie-encrypted';


import {
  liveQuery
} from "dexie";

import {
  useObservable,
  from
} from "@vueuse/rxjs";

import {
  useAccountsStore
} from 'src/stores/accounts';
const accounts = useAccountsStore();

export var syncdb;

const DB = process.env.DB;
// console.log('DB', DB)

const opts = {
  databaseUrl: DB,
  requireAuth: false,
  tryUseServiceWorker: true,
  // periodicSync: {minInterval: 100000}
  customLoginGui: true,
  unsyncedTables: ["_encryptionSettings"],
  // nameSuffix: false,
  disableWebSocket: false,
  // unsyncedTables: ['blocks', 'words', 'units', 'courses', 'student_usernames'],
  unsyncedTables: ['student_usernames'],
  // unsyncedTables: ['units',],
  // fetchTokens: customCallback
}

export const setupSync = function () {

  syncdb = new Dexie('mySyncDatabase', {
    addons: [dexieCloud]
  });

  // setupEncrypt();


  syncdb.version(29).stores({
    subscription: '@id, userId',
    settings: '@id ',
    classrooms: '@id, title, realmId',
    students: '@id, realmId, classroom.id, &userName', //make sure class is always an object with an id
    progress: '@id, realmId, courseId, studentId, [courseId+studentId]',
    links: '@id, studentId',
    //
    blocks: '@id, region', //public
    words: '@id, region', //public
    units: '@id, region', // public
    courses: '@id, region', //public
    student_usernames: "@id, &studentId, &userName", // public
    // lessons: '@id, students, realmId',
    // Access Control tables
    realms: "@realmId",
    members: "@id, email , userId, custom", // Optionally, index things also, like "realmId" or "email".
    roles: "[realmId+name]",
  });


  syncdb.open().catch(function (err) {
    console.error('open err', err.stack || err);
  });


  // Connect your dexie-cloud database:
  syncdb.cloud.configure(opts);

  setupAccountData();

  return syncdb;
}

const setupAccountData = function () {
  accounts.syncdb = syncdb;
  accounts.currentUser = useObservable(syncdb.cloud.currentUser);
  accounts.userPrompts = useObservable(syncdb.cloud.userInteraction);
  accounts.socketStatus = useObservable(syncdb.cloud.webSocketStatus);
  accounts.syncState = useObservable(syncdb.cloud.syncState);
  accounts.invites = useObservable(syncdb.cloud.invites);

  accounts.roles = useObservable(syncdb.cloud.roles);

  useObservable(
    from(
      liveQuery(async () => {
        // console.log(this.accountStore.syncdb);
        accounts.subscription = await syncdb.subscription
          .toCollection()
          .last();

      })
    )
  );

}

export const deleteDb = function deleteDb() {
  syncdb.delete().then(() => {
    console.log("Database successfully deleted");
  }).catch((err) => {
    console.error("Could not delete database");
  }).finally(() => {
    // Do what should be done next...
  });
}

var encryptionKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
const setupEncrypt = function () {
  // // @ts-ignore (need this for typings incompability with dexie-encrypted and dexie 4.x)
  applyEncryptionMiddleware(syncdb, encryptionKey, {
    test: NON_INDEXED_FIELDS,
  }, async () => {
    console.log('key changed')
  });

  function reorderDexieEncrypted(syncdb) {
    // @ts-ignore
    const mw = syncdb._middlewares.dbcore.find(mw => mw.name === 'encryption');
    if (!mw) throw new Error("Dexie encrypted not applied");
    syncdb.use({
      name: "encryption",
      stack: "dbcore",
      level: 2,
      create: mw.create
    });
  }
  reorderDexieEncrypted(syncdb);

}

export default {
  setupSync,
}
