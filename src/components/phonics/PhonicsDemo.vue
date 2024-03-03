<template>
  <q-page class="fit flex column non-selectable bg-texture-12 overflow-hidden">
    <div style="height: calc(100vh - 50px)">
      <PhonicsCourse
        :select_student="null"
        :select_course="null"
        :remote="false"
        :revise_mode="false"
        :next_unit_ready="true"
        :demo="true"
        :demo_units="units"
        :demo_blocks="blocks"
      ></PhonicsCourse>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useAccountsStore } from "src/stores/accounts";
import axios from "axios";

import PhonicsCourse from "./PhonicsCourse.vue";
export default defineComponent({
  name: "DemoPage",
  components: {
    PhonicsCourse,
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
    };
  },
  data() {
    return {
      blocks: [
        {
          id: 0,
          label: "æ",
          value: "ae",
          type: "sound", // or spelling
          icon: "mdi-snail",
          options: [
            { label: "ay", icon: "", sound: null },
            { label: "a-e", icon: "", sound: null },
            { label: "ai", icon: "", sound: null },
            { label: "a", icon: "", sound: null },
            { label: "ea", icon: "", sound: null },
          ], // TODO: shuffle order..
        },
        {
          id: 1,
          label: "ow",
          value: "ow",
          type: "spelling",
          options: [
            { label: "bee", icon: "mdi-bee", sound: null },
            { label: "snail", icon: "mdi-snail", sound: null },
          ],
        },
        {
          id: 2,
          label: "w",
          value: "w",
          type: "sound",
          options: [
            { label: "w", icon: "mdi-bee", sound: null },
            { label: "wh", icon: "mdi-snail", sound: null },
            { label: "^", icon: "mdi-ghost-outline", sound: null },
          ],
        },

        {
          id: 3,
          label: "oe",
          value: "oe",
          type: "sound",
          options: [
            { label: "o", icon: "mdi-bee", sound: null },
            { label: "oa", icon: "mdi-snail", sound: null },
            { label: "ow", icon: "mdi-ghost-outline", sound: null },
            { label: "oe", icon: "mdi-ghost-outline", sound: null },
            // { label: "o-e", icon: "mdi-ghost-outline", sound: null },
          ],
        },
        {
          id: "blc0OrCaNbOLt|faTgrp6u3p7qUlic",
          label: "<augh>-_75",
          value: "<augh>-_75",
          type: "spelling",
          options: [
            { label: "ar+f", icon: null, sound: null },
            {
              label: "or",
              icon: {
                id: "or-phoneme",
                label: "or",
                icon_name: "orIcon",
                sound_src: "or.mp3",
              },
              sound: null,
            },
            // { label: "o-e", icon: "mdi-ghost-outline", sound: null },
          ],
        },
        {
          id: "blc0OrCZxGM7z7Ms0OyChxuctqnlic",
          icon: {
            id: "air-phoneme",
            label: "air",
            icon_name: "airIcon",
            sound_src: "air.mp3",
          },
          type: "sound",
          label: "/air/1_27",
          sound: null,
          options: [
            {
              icon: null,
              label: "air",
              sound: null,
            },
            {
              icon: null,
              label: "are",
              sound: null,
            },
            {
              icon: null,
              label: "ayer",
              sound: null,
            },
            {
              icon: null,
              label: "ayor",
              sound: null,
            },
            {
              icon: null,
              label: "ear",
              sound: null,
            },
            {
              icon: null,
              label: "eir",
              sound: null,
            },
            {
              icon: null,
              label: "ere",
              sound: null,
            },
          ],
        },
      ],
      units: [
        {
          id: "test1",
          label: "Unit 1",
          details: [],
          target: 2,
          // phonic_option_id: 0, // ay, etc..
          words: [
            {
              id: "wrd0OrGd3HAuy5oTIVHHLSlKyaBlic",
              homo: {
                id: 116,
                src: "h/heir",
                name: "h/heir",
                label: "heir",
              },
              type: "sound",
              word: "heir",
              block: {
                id: "blc0OrCZxGM7z7Ms0OyChxuctqnlic",
                label: "/air/1_27",
              },
              sound: null,
              plural: false,
              pattern: [
                {
                  icon: null,
                  block: null,
                  input: false,
                  schwa: false,
                  silent: false,
                  correct: "",
                  exclude: [],
                  letters: "h",
                },
                {
                  icon: {
                    id: "air-phoneme",
                    label: "air",
                    icon_name: "airIcon",
                    sound_src: "air.mp3",
                  },
                  block: {
                    id: "blc0OrCZxGM7z7Ms0OyChxuctqnlic",
                    label: "air",
                  },
                  input: true,
                  schwa: false,
                  silent: false,
                  correct: "",
                  exclude: [],
                  letters: "eir",
                },
              ],
              use_tense: false,
              dictations: [],
              homophones: ["air"],
            },
            {
              id: "break",
              word: "break",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "sound",
              pattern: [
                {
                  letters: "b",
                  input: false,
                  icon: "mdi-airballoon",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "r",
                  input: false,
                  icon: "mdi-robot",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "ea",
                  input: true,
                  icon: "mdi-snail",
                  sound: null,
                  block: 0,
                  exclude: [],
                  correct: "snail", // label
                },
                {
                  letters: "k",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
              ],
              homo: {
                id: 28,
                src: "b/break-1",
                more: [
                  {
                    id: 29,
                    src: "b/break-2",
                    name: "b/break-2",
                    label: "break-2",
                  },
                ],
                name: "b/break-1",
                label: "break-1",
              },
            },
            {
              id: "wrd0OrIM|rdrqx0TwcFjcurccnslic",
              homo: {
                id: 28,
                src: "b/break-1",
                more: [
                  {
                    id: 29,
                    src: "b/break-2",
                    name: "b/break-2",
                    label: "break-2",
                  },
                ],
                name: "b/break-1",
                label: "break-1",
              },
              type: "spelling",
              word: "draught",
              block: {
                id: "blc0OrCaNbOLt|faTgrp6u3p7qUlic",
                label: "<augh>-_75",
              },
              sound: null,
              plural: false,
              pattern: [
                {
                  icon: {
                    id: "d-phoneme",
                    label: "d",
                    icon_name: "dIcon",
                    sound_src: "d.mp3",
                  },
                  block: {
                    label: "d",
                  },
                  input: false,
                  schwa: false,
                  silent: false,
                  correct: "",
                  exclude: [],
                  letters: "d",
                },
                {
                  icon: {
                    id: "r-phoneme",
                    label: "r",
                    icon_name: "rIcon",
                    sound_src: "r.mp3",
                  },
                  block: {
                    label: "r",
                  },
                  input: false,
                  schwa: false,
                  silent: false,
                  correct: "",
                  exclude: [],
                  letters: "r",
                },
                {
                  icon: {
                    id: "ar-phoneme",
                    label: "ar",
                    icon_name: "arIcon",
                    sound_src: "ar.mp3",
                  },
                  block: {
                    id: "blc0OrCaNbOLt|faTgrp6u3p7qUlic",
                    label: "<augh>-_75",
                  },
                  input: true,
                  schwa: false,
                  silent: false,
                  correct: "ar+f",
                  exclude: [],
                  letters: "au",
                },
                {
                  icon: {
                    id: "f-phoneme",
                    label: "f",
                    icon_name: "fIcon",
                    sound_src: "f.mp3",
                  },
                  block: {
                    id: "blc0OrCaNbOLt|faTgrp6u3p7qUlic",
                    label: "<augh>-_75",
                  },
                  input: true,
                  schwa: false,
                  silent: false,
                  correct: "ar+f",
                  exclude: [],
                  letters: "gh",
                },
                {
                  icon: {
                    id: "t-phoneme",
                    label: "t",
                    icon_name: "tIcon",
                    sound_src: "t.mp3",
                  },
                  block: {
                    label: "t",
                  },
                  input: false,
                  schwa: false,
                  silent: false,
                  correct: "",
                  exclude: [],
                  letters: "t",
                },
              ],
              use_tense: false,
              dictations: [],
              homophones: [],
            },

            {
              id: "break",
              word: "break",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "spelling",
              pattern: [
                {
                  letters: "br",
                  input: false,
                  icon: "mdi-snail",
                  sound: null,
                  block: 0,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "ea",
                  input: true,
                  icon: "mdi-snail",
                  sound: null,
                  block: 1,
                  exclude: [],
                  correct: "snail", // label
                },
                {
                  letters: "k",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
              ],
              homo: null,
            },

            {
              id: "yo-yo",
              word: "yo-yo",
              type: "sound",
              pattern: [
                {
                  letters: "y",
                  input: false,
                  icon: "mdi-alpha-y-circle-outline",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                  exlude: [],
                },
                {
                  letters: "o",
                  input: true,
                  icon: "mdi-sail-boat",
                  sound: null,
                  block: 3,
                  exclude: [],
                  correct: "",
                  exlude: ["o-e"],
                },
                {
                  letters: "-",
                  input: false,
                  icon: null,
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                  exlude: [],
                },
                {
                  letters: "y",
                  input: false,
                  icon: "mdi-alpha-y-circle-outline",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                  exlude: [],
                },
                {
                  letters: "o",
                  input: true,
                  icon: "mdi-sail-boat",
                  sound: null,
                  block: 3,
                  exclude: [],
                  correct: "",
                  exlude: ["o-e"],
                },
              ],
              homo: null,
            },
            {
              id: "^one",
              word: "^one",
              type: "sound",
              pattern: [
                {
                  letters: "^",
                  input: true,
                  ghost: true,
                  icon: "mdi-spider-web",
                  sound: null,
                  block: 2,
                  exclude: [],
                  correct: "",
                  exlude: [],
                },
                {
                  letters: "o",
                  input: false,
                  icon: "mdi-owl",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "o",
                  exlude: [],
                },
                {
                  letters: "ne",
                  input: false,
                  icon: "mdi-dot-net",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "ne",
                  exlude: [],
                },
              ],
              homo: null,
            },

            // {
            //   id: "bare",
            //   word: "bare",
            //   // icon: "mdi-snail",
            //   // phonic_option_id: 0, // ay, etc..
            //   // correct: "ai",
            //   type: "sound",
            //   pattern: [
            //     {
            //       letters: "b",
            //       input: false,
            //       icon: "mdi-balloon",
            //       // icon: "mdi-snail",
            //       sound: null,
            //       block: null,
            //       correct: "",
            //       exlude: [],
            //     },
            //     {
            //       letters: "a-e",
            //       input: true,
            //       icon: "mdi-snail",
            //       sound: null,
            //       block: 0,
            //       exclude: [],
            //       correct: "a-e",
            //       exlude: [],
            //     },
            //     {
            //       letters: "r",
            //       input: false,
            //       icon: "mdi-robot",
            //       // icon: "mdi-snail",
            //       sound: null,
            //       block: null,
            //       correct: "",
            //       exlude: [],
            //     },
            //   ],
            //   homo: {
            //     id: "bare",
            //     label: "bare",
            //     src: "mdi-foot-print",
            //   },
            // },
            // {
            //   id: 0,
            //   word: "aid",
            //   // icon: "mdi-snail",
            //   // phonic_option_id: 0, // ay, etc..
            //   // correct: "ai",
            //   type: "sound",
            //   pattern: [
            //     {
            //       letters: "ai",
            //       input: true,
            //       icon: { src: "/phonic-icons/snail-dots.svg" },
            //       // icon: "mdi-snail",
            //       sound: null,
            //       block: 0,
            //       exclude: [],
            //       correct: "ai",
            //     },
            //     {
            //       letters: "d",
            //       input: false,
            //       icon: "mdi-dog-side",
            //       sound: null,
            //       block: null,
            //       exclude: [],
            //       correct: "",
            //     },
            //   ],
            //   homo: null,
            // },
          ],
        },
        {
          id: "test2",
          label: "Unit 2",
          details: [],
          target: 3,
          // phonic_option_id: 0, // ay, etc..
          words: [
            {
              id: 2,
              word: "break",
              // icon: "mdi-snail",
              // phonic_option_id: 0, // ay, etc..
              // correct: "ai",
              type: "spelling",
              pattern: [
                {
                  letters: "br",
                  input: false,
                  icon: "mdi-snail",
                  sound: null,
                  block: 0,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "ea",
                  input: true,
                  icon: "mdi-snail",
                  sound: null,
                  block: 1,
                  exclude: [],
                  correct: "snail", // label
                },
                {
                  letters: "k",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
              ],
              homo: null,
            },
            {
              id: 1,
              word: "day",
              // icon: "mdi-snail",
              // variations: [""],
              // phonic_option_id: 0,
              // correct: "ay",
              type: "sound",
              pattern: [
                {
                  letters: "d",
                  input: false,
                  icon: "mdi-dog-side",
                  sound: null,
                  block: null,
                  exclude: [],
                  correct: "",
                },
                {
                  letters: "ay",
                  input: true,
                  icon: "mdi-airplane",
                  sound: null,
                  block: 0,
                  exclude: [],
                  correct: "ay",
                },
              ],
              homo: null,
            },
          ],
        },
      ],
    };
  },
  mounted() {
    //
  },
  methods: {},
});
</script>
