import {
  useAccountsStore
} from 'src/stores/accounts';

// import {
//   NavigationGuard
// } from 'vue-router';

import {
  syncdb,
  setupSync
} from "src/database/dbCloud";


import {
  liveQuery
} from "dexie";
import {
  useObservable,
  from
} from "@vueuse/rxjs";

export const authGuard = async (to, from, next) => {
  const accounts = useAccountsStore();

  // Fetch user data from the server or local storage
  // await accounts.fetchUser();
  // currentUser.userId !== 'unauthorized'

  // Check if the user is authenticated
  // console.log('user', accounts.currentUser);

  if (accounts.currentUser === null) {
    next('/');
    // setupSync();

    // let userPrompts = useObservable(syncdb.cloud.userInteraction);
    // console.log('userPrompts', userPrompts)
    // let userPrompts = syncdb.cloud.userInteraction
    // console.log('userPrompts', userPrompts)

    // useObservable(
    //   liveQuery(async () => {
    //     // console.log(this.accountStore.syncdb);
    //     let t = await syncdb.cloud.userInteraction;
    //     console.log('t', t)
    //   })
    // );

    // let login = await syncdb.cloud.login()
    // console.log('login', login)



    // let user = syncdb.cloud.currentUser;
    // console.log('user', user.value)
    // if (user.value.userId === 'unauthorized') {
    //   next('/');
    // } else {
    //   next();
    // }

  } else if (accounts.currentUser.userId === 'unauthorized') {
    next('/');
  } else {
    //check email address
    let allowed = ['flipdav8@gmail.com', 'rubdav@hotmail.com']
    if (allowed.includes(accounts.currentUser.userId)) {
      next();
    } else {
      next('/');
    }

  }

  // next();
  // if (accounts.isAuthenticated) {
  //   next();
  // } else {
  //   // You can use try/catch to get an id token and set it to your request header
  //   // ex: try { ... next() } catch { ... next({ name: '/login') }
  //   next('/login');
  // }
};
