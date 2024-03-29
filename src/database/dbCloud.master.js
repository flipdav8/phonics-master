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

// import {
//   useAccountsStore
// } from 'src/stores/accounts';
// const accounts = useAccountsStore();

export var syncdb;

const DB = "https://zc74t809r.dexie.cloud" //master db

const opts = {
  databaseUrl: DB,
  requireAuth: false,
  tryUseServiceWorker: true,
  // periodicSync: {minInterval: 100000}
  customLoginGui: true,
  unsyncedTables: [],
  // nameSuffix: false,
  disableWebSocket: false,
  unsyncedTables: ["_encryptionSettings"],
  // fetchTokens: customCallback
}

export const setupSync = function () {

  syncdb = new Dexie('mySyncDatabaseMaster', {
    addons: [dexieCloud]
  });

  // setupEncrypt();


  syncdb.version(3).stores({
    words: '@id, word',
    products: '@id', //just to test importing..
    products2: '@id', //just to test importing..
    notes: '@id, word_id',
    phonemes: '@id',
  });



  syncdb.open().catch(function (err) {
    console.error('open err', err.stack || err);
  });


  // Connect your dexie-cloud database:
  syncdb.cloud.configure(opts);


  return syncdb;
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

// import {
//   applyEncryptionMiddleware,
//   NON_INDEXED_FIELDS,
//   clearEncryptedTables
// } from 'dexie-encrypted';

// var encryptionKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);

const setupEncrypt = function () {

  var encryptionKey = new Uint8Array(process.env.ENCRYPT.split('-'));

  applyEncryptionMiddleware(syncdb, encryptionKey, {
    words: NON_INDEXED_FIELDS,
    // products2: NON_INDEXED_FIELDS,
  }, async () => {
    console.log('session key changed')
  });

  // applyEncryptionMiddleware(syncdb, encryptionKey, {
  //   test: NON_INDEXED_FIELDS,
  // }, async () => {
  //   console.log('key changed')
  // });

  // function reorderDexieEncrypted(syncdb) {
  //   // @ts-ignore
  //   const mw = syncdb._middlewares.dbcore.find(mw => mw.name === 'encryption');
  //   if (!mw) throw new Error("Dexie encrypted not applied");
  //   syncdb.use({
  //     name: "encryption",
  //     stack: "dbcore",
  //     level: 2,
  //     create: mw.create
  //   });
  // }
  // reorderDexieEncrypted(syncdb);

}

export default {
  setupSync,
}
