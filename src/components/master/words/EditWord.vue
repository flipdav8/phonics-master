<template>
  <div v-if="mounted">
    <q-card flat class="fit flex flex-center column">
      <!-- WORD -->

      <q-card-section class="fit">
        <q-list>
          <q-item>
            <!-- TYPE -->
            <q-item-section>
              <q-select
                label="type"
                outlined
                v-model="new_word.type"
                :options="word_types"
                @update:model-value="(e) => (prefill_type = e)"
                outline="warning"
              ></q-select>
            </q-item-section>

            <!-- BLOCK -->
            <q-item-section>
              <q-btn
                @click="addOptionBlock(new_word)"
                no-caps
                outline
                size="lg"
                :color="new_word.block === null ? 'warning' : ''"
              >
                <span v-if="new_word.block == null">Add Block</span>
                <span v-else>Block: {{ new_word.block.label }} </span>
              </q-btn>
            </q-item-section>
            <!-- REGION -->
            <q-item-section>
              <q-btn no-caps outline size="lg" disable> Region: AU </q-btn>
            </q-item-section>
          </q-item>

          <q-item>
            <!-- word -->
            <q-item-section>
              <q-input
                label="word"
                outlined
                v-model="new_word.word"
                @blur="makePatternFromWord()"
              >
                <template v-slot:after>
                  <q-icon
                    @click="checkExistsInOtherRotation(new_word.word)"
                    class="cursor-pointer"
                    name="mdi-clipboard-text-clock-outline"
                  ></q-icon>
                </template>
              </q-input>
            </q-item-section>

            <!-- sound return later -->
            <!-- <q-item-section class="hidden">
            <q-btn @click="addOptionSound(new_word)" outline no-caps size="lg">
              Sound
              <q-icon
                :name="
                  new_word.sound === null ? 'mdi-speaker-off' : 'mdi-speaker'
                "
                :color="new_word.sound !== null ? 'green' : 'warning'"
              />
            </q-btn>
          </q-item-section> -->
            <!-- homophone -->
            <q-item-section>
              <q-btn
                flat
                @click="addHomoIcon(new_word)"
                class="cursor-pointer"
                no-caps
              >
                <span> Homophone</span>
                <span
                  v-if="
                    new_word.homo != null && new_word.homo.name !== undefined
                  "
                >
                  {{ new_word.homo.label }}
                  <img
                    :src="`/homophone-icons/${new_word.homo.src}.svg`"
                    type="image/svg+xml"
                  />
                </span>
                <q-icon
                  v-else-if="
                    new_word.homo != null && new_word.homo.src !== undefined
                  "
                  size="xl"
                >
                  <img :src="new_word.homo.src" type="image/svg+xml" />
                </q-icon>
                <q-icon
                  v-else-if="
                    new_word.homo != null && new_word.homo.includes('mdi')
                  "
                  :name="new_word.homo"
                  size="md"
                ></q-icon>
                <q-icon v-else name="mdi-plus" size="md"></q-icon>
              </q-btn>
            </q-item-section>

            <!-- tense -->
            <q-item-section>
              <q-checkbox
                v-model="new_word.use_tense"
                label="tense?"
              ></q-checkbox>
              <q-select
                v-if="new_word.use_tense"
                dense
                outlined
                v-model="new_word['tense']"
                label="tense"
                :options="['past', 'present', 'future']"
              ></q-select>
            </q-item-section>

            <q-item-section>
              <q-checkbox v-model="new_word.plural" label="plural"></q-checkbox>
            </q-item-section>
          </q-item>

          <q-item>
            <!-- phonemes word .. for making things quicker..   -->
            <q-item-section>
              <q-input
                class="show_border"
                label="word letters"
                outlined
                v-model="word_letters"
                @blur="makePatternFromWordV2()"
              >
              </q-input>
            </q-item-section>

            <!-- phonemes word .. for making things quicker..   -->
            <q-item-section>
              <q-input
                label="word phonemes"
                outlined
                v-model="word_phonemes"
                @blur="guessPhonemes()"
              >
              </q-input>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- PATTERN -->

      <div class="flex row justify-center hidden">
        <!-- <q-btn @click="clearSounds()" flat no-caps>Clear Sounds</q-btn> -->
        <!-- <q-btn @click="clearBlocks()" flat no-caps>
      Clear Non-input Blocks
    </q-btn> -->

        <q-btn @click="redoIcons()" flat no-caps> Redo Icons </q-btn>
      </div>

      <q-card-section class="fit q-pa-md">
        <q-list>
          <div class="q-ma-md">
            <div class="flex column q-mx-sm q-gutter-sm items-center">
              <span class="flex row">
                <span class="q-mr-sm">Pattern:</span>
                <span v-for="(s, idx) in new_word.pattern" :key="idx">
                  <strong v-if="s.input">{{ s.letters }}</strong>
                  <span v-else> {{ s.letters }}</span> -</span
                >
              </span>

              <div
                v-for="(s, idx) in new_word.pattern"
                :key="idx"
                class="flex row items-center my-pill fit justify-between q-px-sm q-mt-md"
              >
                <!-- :class="{ 'bg-warning': s.input && s.block == null }" -->
                <!-- LETTERS -->
                <div class="col-2">
                  <q-input
                    label="letters"
                    v-model="s.letters"
                    flat
                    dense
                    outlined
                    class="q-my-sm col-4"
                  ></q-input>
                </div>

                <!-- INPUT -->
                <div class="flex row items-center">
                  <span class="text-caption">Input</span>
                  <q-toggle
                    v-model="s.input"
                    @update:model-value="updateInput(s)"
                  ></q-toggle>
                </div>
                <!-- schwa -->
                <div class="flex row items-center">
                  <span class="text-caption">schwa</span>
                  <q-checkbox v-model="s.schwa"></q-checkbox>
                </div>

                <div class="flex row items-center">
                  <span class="text-caption">silent</span>
                  <q-checkbox
                    v-model="s.silent"
                    @update="s['silent_letters'] = s.letters"
                  ></q-checkbox>
                </div>

                <div class="flex row items-center" v-if="s.silent">
                  <q-input
                    label="Silent letters"
                    dense
                    outlined
                    v-model="s['silent_letters']"
                  ></q-input>
                </div>

                <!-- ICON + SOUND -->
                <div class="flex q-gutter-x-sm">
                  <q-btn
                    :color="s.icon != null ? 'green' : 'warning'"
                    @click="addOptionPhoneme(s)"
                    outline
                    no-caps
                  >
                    ++Icon/Sound
                    <span v-if="s.icon != null">
                      <component
                        :is="s.icon.icon_name"
                        color="grey-10"
                        :label="false"
                        :dots="false"
                        :center="true"
                        :scale="true"
                        style="border-radius: 10px; font-size: 40px"
                        class="overflow-hidden"
                      ></component>
                    </span>
                  </q-btn>
                </div>

                <!-- <q-btn
              icon="mdi-pencil-plus-outline"
              flat
              @click="editWordPattern(idx)"
            ></q-btn> -->

                <!-- DELETE -->
                <q-btn
                  icon="mdi-delete-outline"
                  color="red"
                  flat
                  @click="removePattern(idx)"
                ></q-btn>

                <!-- v-if="s.input" -->
                <!-- (!s.input && s.block != null) || -->
                <div
                  class="col-12 q-my-sm flex row justify-start items-center"
                  :class="s.input && s.block == null ? 'bg-red' : ''"
                >
                  <!-- BLOCK -->
                  <q-btn @click="addOptionBlock(s)" no-caps outline size="lg">
                    <span v-if="s.block == null">Add Block</span>
                    <span v-else>Block: {{ s.block.label }}</span>
                  </q-btn>
                  <q-btn
                    v-if="s.block !== null"
                    @click="s.block = null"
                    icon="mdi-close"
                    flat
                    no-caps
                    color="negative"
                  >
                  </q-btn>
                </div>

                <div
                  v-if="s.input && s.block !== null"
                  class="col-12 q-my-sm flex row justify-between items-center"
                >
                  <!-- CORRECT -->
                  <div
                    v-if="
                      s.input &&
                      s.block !== null &&
                      new_word.type === 'spelling'
                    "
                    class="col-5"
                  >
                    <q-select
                      label="correct"
                      v-model="s.correct"
                      flat
                      dense
                      outlined
                      :options="
                        s.block == null
                          ? []
                          : blocks.find((e) => e.id === s.block.id).block
                              .options
                      "
                      :option-value="(e) => e.label"
                      emit-value
                    >
                      <template v-slot:option="{ itemProps, opt }">
                        <q-item v-bind="itemProps">
                          <q-item-section>
                            <q-item-label>
                              {{ opt.label }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            {{ opt.icon }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                    <q-icon
                      v-if="s.correct.length < 1"
                      name="mdi-alert"
                      color="negative"
                      size="md"
                    ></q-icon>
                  </div>
                  <!-- EXCLUDE -->
                  <div v-if="s.input && s.block !== null" class="col-5">
                    <q-select
                      label="Exclude"
                      v-model="s.exclude"
                      multiple
                      flat
                      dense
                      outlined
                      :options="
                        s.block == null
                          ? []
                          : blocks.find((e) => e.id === s.block.id).block
                              .options
                      "
                      :option-value="(e) => e.label"
                      emit-value
                      clearable
                      @clear="s.exclude = []"
                    >
                      <template v-slot:option="{ itemProps, opt }">
                        <q-item v-bind="itemProps">
                          <q-item-section>
                            <q-item-label>
                              {{ opt.label }}
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            {{ opt.icon }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>
              <q-btn
                flat
                icon="mdi-plus"
                size="md"
                @click="addPattern()"
              ></q-btn>
            </div>
          </div>
        </q-list>
      </q-card-section>

      <!-- Dictations.. -->
      <q-card-section class="fit q-pa-md">
        <div class="flex row items-center justify-center">
          Dictations: (tba.. need to make objects to enter recordings)
          <q-btn
            @click="add_dictation = !add_dictation"
            flat
            no-caps
            icon="mdi-plus"
            disabled
          >
          </q-btn>

          <div class="flex column full-width q-gutter-sm">
            <div
              v-for="(dict, i) in new_word.dictations"
              :key="i"
              class="col-grow"
            >
              <q-input
                v-model="new_word.dictations[i]"
                outlined
                type="textarea"
                autogrow
                clearable
                @clear="removeDictation(i)"
              ></q-input>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Homophones.. -->
      <q-card-section class="fit q-pa-md">
        <!-- homophone -->

        <div class="flex row items-center justify-center">
          <q-btn
            flat
            @click="addHomoIcon(new_word)"
            class="cursor-pointer"
            no-caps
          >
            <span> Homophone</span>
            <span
              v-if="new_word.homo != null && new_word.homo.name !== undefined"
            >
              {{ new_word.homo.label }}
              <img
                :src="`/homophone-icons/${new_word.homo.src}.svg`"
                type="image/svg+xml"
              />
            </span>
            <q-icon v-else name="mdi-plus" size="md"></q-icon>
          </q-btn>

          Homophones:
          <q-btn
            @click="add_homophone = !add_homophone"
            flat
            no-caps
            icon="mdi-plus"
          >
          </q-btn>

          <div class="flex row full-width q-gutter-sm">
            <div v-for="(hom, i) in new_word.homophones" :key="i" class="col-">
              <q-input
                v-model="new_word.homophones[i]"
                outlined
                clearable
                @clear="removeHomophone(i)"
              ></q-input>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="self-end q-gutter-x-sm">
        <q-btn no-caps @click="cancelNew()">Cancel</q-btn>

        <q-btn
          color="green"
          no-caps
          :disable="new_word.pattern.length < 1"
          @click="addWord()"
        >
          <span v-if="bulk_mode">Edit Word</span>
          <span v-else>
            {{ edit_id === null ? "Add New Word" : "Apply Changes" }}</span
          >
        </q-btn>
      </q-card-section>

      <q-dialog v-model="word_exists">
        <div class="flex column q-gutter-sm">
          <q-card
            v-for="(word, i) in existing_words"
            :key="i"
            @click="selectPriorWord(word)"
            class="cursor-pointer"
            :class="{
              disabled: word.word.type !== new_word.type,
              'no-pointer-events': word.word.type !== new_word.type,
            }"
          >
            <q-card-section>
              {{ word.word.type }}
              <q-chip> {{ word.word.word }} </q-chip>
              {{ word.word.block.label }}
            </q-card-section>
          </q-card>
        </div>
      </q-dialog>

      <q-dialog v-model="show_icons" full-height full-width>
        <!-- homophones -->
        <HomophonesList
          v-if="edit_option === null"
          v-model:model_icon="new_word.homo"
          :homophones="homophones"
          :word="new_word"
          @close="show_icons = false"
        ></HomophonesList>

        <IconList
          v-else
          v-model:model_icon="edit_option.icon"
          :icons="icons"
          :phonemes="phonemes"
          @close="show_icons = false"
        ></IconList>
      </q-dialog>

      <q-dialog v-model="show_sounds" full-height full-width>
        <SoundList
          v-model:model_sound="edit_option.sound"
          :sounds="sounds"
          :letters="edit_option.letters"
          :block="new_word.block"
          :input="edit_option.input"
          :phonemes="phonemes"
          @close="show_sounds = false"
        ></SoundList>
      </q-dialog>

      <q-dialog v-model="show_phonemes" full-height full-width>
        <!-- Homophones not yet done..  -->
        <PhonemesList
          v-model:model_icon="edit_option.icon"
          :phonemes="phonemes"
          :letters="edit_option.letters"
          :block="new_word.block"
          :input="edit_option.input"
          :type="new_word.type"
          :correct="edit_option.correct"
          :option="edit_option"
          @close="show_phonemes = false"
        ></PhonemesList>
      </q-dialog>

      <q-dialog v-model="show_blocks" full-height full-width>
        <BlockList
          v-model:model_block="edit_option.block"
          :blocks="blocks.map((e) => ({ ...e.block, id: e.id }))"
          @close="show_blocks = false"
          @update="(e) => $emit('update:prefill_block', e)"
          :filter_type="new_word.type"
        >
        </BlockList>
      </q-dialog>

      <q-dialog v-model="add_dictation">
        <q-card>
          <q-card-section>
            <q-input outlined v-model="dictation" type="textarea" autogrow>
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-btn @click="addDictation()">Add/Edit</q-btn>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="add_homophone">
        <q-card>
          <q-card-section>
            <q-input outlined v-model="homophone"> </q-input>
          </q-card-section>
          <q-card-section>
            <q-btn @click="addHomophone()">Add/Edit</q-btn>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from "vue";

import IconList from "src/components/master/IconList.vue";
import HomophonesList from "src/components/master/HomophonesList.vue";
import SoundList from "src/components/master/SoundList.vue";
import BlockList from "src/components/master/BlockList.vue";
import PhonemesList from "src/components/master/PhonemesList.vue";

import PhonicsWord from "src/components/phonics/PhonicsWord.vue";

import WORDS from "src/components/master/words/unit-words.json";
import { Warning } from "postcss";

export default defineComponent({
  name: "WordsPage",
  components: {
    IconList,
    SoundList,
    BlockList,
    PhonicsWord,
    PhonemesList,
    HomophonesList,
  },
  props: {
    input_word: {},
    edit_id: {},
    phonemes: {},
    prefill_block: {},
    icons: {},
    sounds: {},
    homophones: {},
    words: {},
    word_rows: {},
    blocks: {},
    bulk_mode: {},
  },
  setup() {
    return {
      //
    };
  },
  data() {
    return {
      mounted: false,
      new_word: null,

      word_types: [
        "sound",
        "spelling",
        { label: "something else", disable: true },
      ],

      edit_option: null,
      show_icons: false,
      show_sounds: false,
      show_blocks: null,
      show_phonemes: false,

      word_exists: false,
      existing_words: [],
      //
      word_phonemes: "",
      word_letters: "",

      dictation: "",
      add_dictation: false,
      //
      homophone: "",
      add_homophone: false,
    };
  },
  mounted() {
    this.new_word = this.input_word;
    this.mounted = true;
  },

  methods: {
    cancelNew() {
      this.$emit("cancel");
    },

    addWord() {
      this.$emit("update:input_word", this.new_word);
      this.$emit("addWord");
    },
    addOptionBlock(option) {
      this.show_blocks = true;
      this.edit_option = option;
    },

    addOptionPhoneme(option) {
      this.show_phonemes = true;
      this.edit_option = option;
    },

    addHomoIcon(new_word) {
      this.show_icons = true;
      this.edit_option = null;
    },

    updateInput(option) {
      // console.log("option", option);
      if (option.input) {
        option.block = this.prefill_block;
      } else {
        option.block = null;
      }
    },
    addDictation() {
      this.new_word.dictations.push(this.dictation);
      this.add_dictation = false;
    },

    removeDictation(i) {
      this.new_word.dictations.splice(i, 1);
    },

    addHomophone() {
      this.new_word.homophones.push(this.homophone);
      this.add_homophone = false;
    },

    removeHomophone(i) {
      this.new_word.homophones.splice(i, 1);
    },
    makePatternFromWord() {
      let word = this.new_word.word;
      this.checkExistsInOtherRotation(word);
      if (this.new_word.pattern.length > 0) return;

      return; // see v2
      //check if word already exists first!!

      console.log(this.new_word);

      let split = word.split("");
      // console.log("split", split);

      for (let idx = 0; idx < split.length; idx++) {
        const letter = split[idx];
        this.pattern_template.letters = letter;
        this.addPattern();
      }
    },

    async checkExistsInOtherRotation(word) {
      let check = false;
      try {
        check = await syncdb.words.where("word.word").equals(word).toArray();
      } catch (error) {
        let status = `Failed to read words: ${error}`;
        console.log("status error", status);
      }

      console.log("same word exists elsewhere?", check);

      if (check !== false && check.length > 0) {
        // this.new_word.past
        this.word_exists = true;
        this.existing_words = check;
      }
    },

    makePatternFromWordV2() {
      if (this.new_word.pattern.length > 0) return;
      let split = this.word_letters.split(/(\s+)/).filter(function (e) {
        return e.trim().length > 0;
      });

      // this.new_word.word = split.join("");
      this.new_word.word = this.makeWordFromPattern(split);

      this.checkExistsInOtherRotation(this.new_word.word);

      let block_options = [];
      // console.log("this.new_word.block ", this.new_word.block);
      if (this.new_word.block !== null && this.new_word.type === "sound") {
        let unmapped_block_options = this.blocks.find(
          (e) => e.id === this.new_word.block.id
        ).block.options;

        block_options = unmapped_block_options.map((e) => e.label);
        // console.log("block options", block_options);
      }

      for (let idx = 0; idx < split.length; idx++) {
        const letters = split[idx];
        this.pattern_template.letters = letters;

        if (block_options.includes(letters)) {
          this.addPattern(true);
        } else {
          this.addPattern();
        }
      }

      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const pattern = this.new_word.pattern[idx];
        if (pattern.input) {
          // let block_label = this.new_word.block.label.split("/")[1];
          // this.guessPhoneme(pattern, block_label);
        } else {
          this.guessPhoneme(pattern, pattern.letters);
        }
      }
    },

    makeWordFromPattern(map) {
      let w = map.join("");

      if (w.includes("-")) {
        // let str = "ba-er";
        // let str = "ga-ez";
        // let str = "ama-ezd";
        // let str = "volu-em";
        let str = w;
        let split = str.split("");
        function rearrangeArray(arr) {
          let result = [];
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] === "-" && i + 1 < arr.length) {
              result.push(arr[i + 2]);
              result.push(arr[i + 1]);
            } else if (i === 0 || (arr[i - 2] !== "-" && arr[i - 1] !== "-")) {
              result.push(arr[i]);
            }
          }
          return result;
        }

        let arr = split;
        let re = rearrangeArray(arr);
        w = re.join("");
      }

      let ww = w;
      //exists because of words like yo-yo
      if (w.includes("_")) {
        ww = w.replaceAll("_", "-");
      }

      return ww;
    },

    guessPhonemes() {
      // console.log("word_ponemes", this.word_phonemes.split(/(\s+)/));
      let split_p = this.word_phonemes.split(/(\s+)/).filter(function (e) {
        return e.trim().length > 0;
      });

      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const pattern = this.new_word.pattern[idx];
        let letters = split_p[idx];
        if (letters != undefined) {
          this.guessPhoneme(pattern, letters);
        }
      }
    },

    guessPhoneme(pattern, letters) {
      let search_label = letters;
      if (letters === "*") {
        search_label = "schwa";
      } else if (letters.includes("-")) {
        let split = letters.split("-");
        search_label = split[0] + split[1];
      } else {
        if (letters === "c") {
          search_label = "k";
        } else if (letters === "ph") {
          search_label = "f";
        } else if (letters === "kn") {
          search_label = "n";
        } else if (letters === "ll") {
          search_label = "l";
        } else if (letters === "nn") {
          search_label = "n";
        } else if (letters === "gg") {
          search_label = "g";
        } else if (letters === "rr") {
          search_label = "r";
        } else if (letters === "ss") {
          search_label = "s";
        } else if (letters === "y") {
          // search_label = "";
          // will depend if y is at the end of word.. might be ee..
        } else {
          search_label = letters;
        }
      }

      // console.log("guestt", pattern, letters);
      let phoneme = this.phonemes.find((e) => e.label === search_label);

      if (phoneme !== undefined) {
        let set_icon = {
          id: phoneme.id,
          label: phoneme.label,
          icon_name: phoneme.icon_name,
          sound_src: phoneme.sound_src,
        };
        pattern.icon = set_icon;
      } else {
        pattern.icon = null;
      }
    },

    selectPriorWord(word) {
      this.new_word.pattern = JSON.parse(JSON.stringify(word.word.pattern));

      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const element = this.new_word.pattern[idx];
        // element.input = false;
        element.block = null;
      }
    },

    redoIcons() {
      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const pattern = this.new_word.pattern[idx];
        this.guessPhoneme(pattern, pattern.letters);
      }
      // alert("done");
    },
  },
});
</script>
