<template>
  <div class="flex row items-center">
    <q-btn flat no-caps @click="playWord()" icon-right="mdi-volume-plus">
      Play Sound
    </q-btn>

    <q-btn flat no-caps @click="playWordIPA()" icon-right="mdi-volume-plus">
      Play (ipa)
    </q-btn>

    <q-btn flat no-caps @click="playWordOAI()" icon-right="mdi-volume-plus">
      Play (open ai)
    </q-btn>

    <q-btn flat no-caps @click="playWord11()" icon-right="mdi-volume-plus">
      Play (11)
    </q-btn>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

import PHONEMES from "/src/components/icons/phonemes.js";
const phonemes = PHONEMES.list;

// import MoveLetters from "/src/components/animations/MoveLetters.vue";

import pos_options from "./pos-options-groups.json";
import word_tags from "./word-tag-ids.json";
import sense_tags from "./sense-tag-ids.json";

import { createClient } from "@supabase/supabase-js";

import { supabase } from "src/components/supabase/supabase.js";

import axios from "axios";

import OpenAI from "openai";

export default defineComponent({
  // name: "forms",
  components: {
    // MoveLetters
  },
  props: {
    row: {},
    word: {},
    ref_view: {},
  },
  setup() {
    return {
      pos_options,
      word_tags,
      sense_tags,
    };
  },
  data() {
    return {
      mounted: false,
      file_img: null,
      file_paths: [],
      files: [],
      select: [],
      show_images: true,
      search: "",
    };
  },
  mounted() {
    this.mounted = true;
  },
  computed() {},
  methods: {
    async playWord() {
      let text = this.word;

      // let text = "the amazon rainforest";
      console.log("text", text);
      // return;
      // return;
      const headers = {
        // Accept: "audio/mpeg",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        // Authorization: "Bearer " + token,
        "Content-Type": "application/ssml+xml",
        // "User-Agent": "speech-test-2",
        "X-Microsoft-OutputFormat": "riff-44100hz-16bit-mono-pcm",
      };

      //see https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#audio-outputs
      // const region = process.env.AZURE_SPEECH_REGION;
      // const get_voices = await axios.get(
      //   `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      //   {
      //     headers: headers,
      //   }
      // );
      // console.log("get_voics", get_voices);
      // <phoneme alphabet="ipa" ph="θ"> tomato </phoneme>

      // voices: ["en-AU-TinaNeural", "en-AU-KenNeural"]
      let voice_id = "en-AU-KimNeural";
      // voice_id = "en-AU-TinaNeural";
      // voice_id = "en-AU-KenNeural";
      // voice_id = "en-AU-CarlyNeural";
      // voice_id = "en-GB-SoniaNeural";
      // voice_id = "en-US-AvaNeural";

      //  voice_id = "en-AU-NeilNeural";
      // const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">a cool pickly went dancing</voice></speak>`;
      // let ipa = "θ";

      //

      // amazon
      // text = "amazon";

      let reg = "en-AU";
      let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${reg}"><voice name="${voice_id}">
             ${text}
        </voice></speak>`;

      let endpoint =
        "https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1";

      // let test_ph = [0, 21, 37, 48, 37, 22];
      // let ipa = test_ph
      //   .map((e) => PHONEMES.find((f) => f.list_id === e).IPA_symbol)
      //   .join("");

      let ipa = "æməzən"; // vs "æməzɒn";
      console.log(ipa);
      let ssml_ph = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">
        <phoneme alphabet="ipa" ph="${ipa}"></phoneme>
        </voice></speak>`;

      const body = ssml;

      const voice_response = await axios.post(endpoint, body, {
        headers: headers,
        // responseType: "arraybuffer", // This is important for handling binary data
        responseType: "blob",
      });

      console.log("voice_response", voice_response);
      // return;

      // const audio1 = new Audio(URL.createObjectURL(voice_response.data));
      // audio1.play();

      const audioUrl = URL.createObjectURL(voice_response.data);
      const audio = new Audio(audioUrl);
      await audio.play();

      this.downloadAudio(audioUrl);
    },

    async playWordIPA() {
      let text = this.word;

      // let text = "the amazon rainforest";
      console.log("text", text);
      // return;
      // return;
      const headers = {
        // Accept: "audio/mpeg",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        // Authorization: "Bearer " + token,
        "Content-Type": "application/ssml+xml",
        // "User-Agent": "speech-test-2",
        "X-Microsoft-OutputFormat": "riff-44100hz-16bit-mono-pcm",
      };

      //see https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#audio-outputs
      // const region = process.env.AZURE_SPEECH_REGION;
      // const get_voices = await axios.get(
      //   `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      //   {
      //     headers: headers,
      //   }
      // );
      // console.log("get_voics", get_voices);
      // <phoneme alphabet="ipa" ph="θ"> tomato </phoneme>

      // voices: ["en-AU-TinaNeural", "en-AU-KenNeural"]
      let voice_id = "en-AU-KimNeural";
      // voice_id = "en-AU-TinaNeural";
      // voice_id = "en-AU-KenNeural";
      // voice_id = "en-AU-CarlyNeural";
      // voice_id = "en-GB-SoniaNeural";
      // voice_id = "en-US-AvaNeural";

      //  voice_id = "en-AU-NeilNeural";
      // const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">a cool pickly went dancing</voice></speak>`;
      // let ipa = "θ";

      //

      // amazon
      // text = "amazon";

      let reg = "en-AU";
      let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${reg}"><voice name="${voice_id}">
             ${text}
        </voice></speak>`;

      let endpoint =
        "https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1";

      let test_ph = this.row.pids;

      let combine_id = this.word.id;
      let ref_view = this.ref_view;

      console.log("ref_view", ref_view);
      if (ref_view !== undefined && ref_view[0] !== undefined) {
        test_ph = ref_view[0].use_pids;
      }

      let ipa = test_ph
        .map(
          (e) =>
            phonemes.find((f) => f.list_id.toString() === e.toString())
              .IPA_symbol
        )
        .join("");

      // let ipa = "æməzən"; // vs "æməzɒn";
      console.log(ipa);
      let ssml_ph = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice_id}">
        <phoneme alphabet="ipa" ph="${ipa}"></phoneme>
        </voice></speak>`;

      const body = ssml_ph;

      const voice_response = await axios.post(endpoint, body, {
        headers: headers,
        // responseType: "arraybuffer", // This is important for handling binary data
        responseType: "blob",
      });

      console.log("voice_response", voice_response);
      // return;

      const audioUrl = URL.createObjectURL(voice_response.data);
      const audio = new Audio(audioUrl);
      await audio.play();

      this.downloadAudio(audioUrl);
    },

    downloadAudio(audioUrl) {
      return;
      // Create a link element
      const downloadLink = document.createElement("a");
      downloadLink.href = audioUrl;
      downloadLink.download = "audio_file.mp3"; // specify the desired file name
      // Trigger a click event on the link element to start the download
      downloadLink.click();
      // Clean up resources
      URL.revokeObjectURL(audioUrl);
    },
    async playWordOAI() {
      let key = process.env.AI_KEY;
      const openai = new OpenAI({
        apiKey: key,
        // organization: key,
        dangerouslyAllowBrowser: true,
      });

      let word = this.word;
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        // model: "tts-1-hd",
        voice: "fable",
        // input: "- " + word + " -",
        input: word,
      });
      // const buffer = Buffer.from(await mp3.arrayBuffer());
      const arrayBuffer = await mp3.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioElement = new Audio(audioUrl);
      audioElement.playbackRate = 0.8;
      audioElement.play();
    },

    async playWord11() {
      // const options1 = {
      //   method: "GET",
      //   headers: {
      //     "xi-api-key": process.env.ELEVEN_KEY,
      //   },
      // };

      // // fetch("https://api.elevenlabs.io/v1/voices", options1)
      // fetch("https://api.elevenlabs.io/v1/models", options1)
      //   .then((response) => response.json())
      //   .then((response) => console.log(response))
      //   .catch((err) => console.error(err));

      // return;

      const headers = {
        Accept: "audio/mpeg",
        "xi-api-key": process.env.ELEVEN_KEY,
        "Content-Type": "application/json",
      };

      let text = this.word;
      const body = JSON.stringify({
        text: text,
        // model_id: "eleven_monolingual_v1", bad a single words
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      });

      let voice_id = "IKne3meq5aSn9XLyUdCD";
      const response = await axios.post(
        // `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        body,
        {
          headers: headers,
          // responseType: "arraybuffer", // This is important for handling binary data
          responseType: "blob",
        }
      );

      const audio1 = new Audio(URL.createObjectURL(response.data));
      audio1.preload = "auto";

      audio1.addEventListener("canplaythrough", function () {
        // Audio is ready to play without interruption
        audio1.play();
      });
      // audio1.play();

      // console.log("response", response);
    },

    async listImages() {
      const { data, error } = await supabase.storage
        .from("images")
        .list("words", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
          search: this.search,
        });

      this.files = data
        .filter((e) => e.name !== ".emptyFolderPlaceholder")
        .map((e) => `${e.name}`);
      // console.log("data", this.files);
    },

    async uploadImage() {
      if (this.select.length > 0) {
        this.updateWord(this.select);
        return;
      }
      // console.log("this.file_img", this.file_img);
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`words/${this.file_img.name}`, this.file_img);
      if (error) {
        // Handle error
        console.log("error", error);
      } else {
        // Handle success
        console.log("uploaded", data);
        this.file_paths.push(data.path);
        this.updateWord(data.path);
      }
    },

    async updateWord(path) {
      let img_update = this.file_paths;
      // if (this.row.imgs !== null) img_update = this.row.imgs;
      if (Array.isArray(path)) {
        img_update.push(...path.map((e) => `words/${e}`));
      } else {
        img_update.push(path);
      }
      // let update = {
      //   id: this.row.id,
      //   imgs: img_update,
      // };
      // console.log("update", update);

      const { data, error } = await supabase
        .from("combine")
        .update({ imgs: img_update })
        .eq("id", this.row.id)
        .select();

      console.log("data", data);
      console.log("error", error);
    },

    async clearImages() {
      const { data, error } = await supabase
        .from("combine")
        .update({ imgs: null })
        .eq("id", this.row.id)
        .select();

      console.log("data", data);
      console.log("error", error);
    },
  },
});
</script>

<style></style>
