<template>
  <div class="hiddenS">
    <form
      v-if="!logged_in"
      class="row flex-center flex"
      @submit.prevent="handleLogin"
    >
      <div class="col-10 form-widget">
        <p class="description">Sign in via magic link with your email below</p>
        <div>
          <q-input
            outlined
            dense
            required
            type="email"
            placeholder="Your email"
            v-model="email"
          />
        </div>
        <div>
          <input
            type="submit"
            class="button block"
            :value="loading ? 'Loading' : 'Send OTP link'"
            :disabled="loading"
          />
        </div>
      </div>
    </form>
    <div v-if="verify_needed">
      <q-input outlined dense label="OTP" v-model="otp"> </q-input>
      <q-btn dense no-caps flat @click="verifyOTP()">Verify</q-btn>
    </div>

    <q-btn @click="checkSession">Check Session</q-btn>
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs } from "vue";
import { supabase } from "src/components/supabase/supabase.js";

const loading = ref(false);
const email = ref("");
const verify_needed = ref(false);
const otp = ref("");
const logged_in = ref(false);

onMounted(() => {
  checkSession();
});

// localStorage.setItem("test", 1);
console.log("test", localStorage.getItem("test"));

const checkSession = async () => {
  supabase.auth.getSession().then(({ data }) => {
    // console.log("data", data);
    if (data?.session?.access_token) {
      logged_in.value = true;
    }
  });

  // console.log(
  //   window.localStorage.getItem("sb-icspkjuoqnyhkcccstgp-auth-token")
  // );

  // const { data, error } = await supabase.auth.getSession();
  //
  // console.log("session data logged in", data);

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // console.log("user", user);

  supabase.auth.onAuthStateChange((event, session) => {
    // Code to handle token storage and removal
    console.log("event", event);
    console.log("event session", session);
  });

  return;
  let sesh = {
    access_token:
      "eyJhbGciOiJIUzI1NiIsImtpZCI6ImdndTcybHV3SlVGYXhnODQiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzExMTk0NzA3LCJpYXQiOjE3MTExOTExMDcsImlzcyI6Imh0dHBzOi8vaWNzcGtqdW9xbnloa2NjY3N0Z3Auc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImRjZGY0YTQzLTliMmItNDAxNC04ODJjLWVkNDU4YTM0YzhmZCIsImVtYWlsIjoiZmxpcGRhdjhAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImZsaXBkYXY4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJkY2RmNGE0My05YjJiLTQwMTQtODgyYy1lZDQ1OGEzNGM4ZmQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3MTExOTExMDd9XSwic2Vzc2lvbl9pZCI6ImVmYjljNzg3LTA0OGQtNDg4My04MWM2LWQ1OTgxMWI4NTYxZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.U9_jVjihf4Iox_3pZMgz8wu-EmL5qcLBUGZfLRb0Erg",
    refresh_token: "AQIegPOoJqRJoU8msom0Sg",
  };

  setSession(sesh);
};

const handleLogin = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.value,
    });
    if (error) throw error;
    verify_needed.value = true;
    alert("Check your email for the login link!");
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
  } finally {
    loading.value = false;
  }
};

const verifyOTP = async () => {
  try {
    loading.value = true;
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email: email.value,
      token: otp.value,
      type: "email",
    });
    if (error) throw error;

    console.log("session", session);

    // console.log(
    //   window.localStorage.getItem("sb-icspkjuoqnyhkcccstgp-auth-token")
    // );
    console.log("error", error);

    // await supabase.auth.signOut();

    // setSession(session);

    let access_token = session.access_token;
    let refresh_token = session.refresh_token;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  } finally {
    loading.value = false;
  }
};

const setSession = async (session) => {
  if (session === null) return;
  let access_token = session.access_token;
  let refresh_token = session.refresh_token;
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  console.log("data", data);
  console.log("error", error);

  const userSession = await supabase.auth.getSession();
  console.log("userSession 1:", userSession); // This now has the user session as expected
};

const logout = async () => {};
</script>
