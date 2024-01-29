<template>
  <div class="fit q-pa-md non-selectable">
    <!-- NEW WORD -->
    <q-card
      v-if="add_word && !operation"
      flat
      class="fit flex flex-center column"
    >
      <!-- WORD -->
      <!-- //TODO:  ADD DICTATION SENTENCE -->
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
            <q-item-section class="hidden">
              <q-btn
                @click="addOptionSound(new_word)"
                outline
                no-caps
                size="lg"
              >
                Sound
                <q-icon
                  :name="
                    new_word.sound === null ? 'mdi-speaker-off' : 'mdi-speaker'
                  "
                  :color="new_word.sound !== null ? 'green' : 'warning'"
                />
              </q-btn>
            </q-item-section>
            <!-- homophone -->
            <q-item-section>
              <q-btn
                flat
                @click="addHomoIcon(new_word)"
                class="cursor-pointer"
                no-caps
              >
                <span> Homophone</span>
                <q-icon
                  v-if="
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
          </q-item>

          <q-item>
            <!-- phonemes word .. for making things quicker..   -->
            <q-item-section>
              <q-input
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

      <div class="flex row justify-center">
        <q-btn @click="clearSounds()" flat no-caps>Clear Sounds</q-btn>
        <q-btn @click="clearBlocks()" flat no-caps
          >Clear Non-input Blocks</q-btn
        >
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
                  <!-- ICON -->
                  <span v-if="s.icon != null && s.icon.icon_name">
                    {{ s.icon.icon_name }}
                  </span>

                  <!-- <q-btn @click="addOptionIcon(s)" outline no-caps>
                    <q-icon v-if="s.icon.src !== undefined" size="xl">
                      <img :src="s.icon.src" type="image/svg+xml" />
                    </q-icon>
                    <q-icon
                      v-else-if="s.icon.includes('mdi')"
                      :name="s.icon"
                      size="md"
                    ></q-icon>
                    <div v-else>Icon <q-icon name="mdi-plus" size="md" /></div>
                  </q-btn> -->

                  <q-btn @click="addOptionSound(s)" outline no-caps>
                    Sound {{ s.sound === null ? "" : s.sound.id.split("-")[0] }}
                    <q-icon
                      :name="
                        s.sound === null ? 'mdi-speaker-off' : 'mdi-speaker'
                      "
                      :color="s.sound !== null ? 'green' : 'warning'"
                    />
                  </q-btn>

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
                <div
                  class="col-12 q-my-sm flex row justify-start items-center"
                  :class="
                    (!s.input && s.block != null) ||
                    (s.input && s.block == null)
                      ? 'bg-red'
                      : ''
                  "
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
        <div class="flex row items-center justify-center">
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
          {{ edit_id === null ? "Add New Word" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>

    <div v-if="operation">
      <q-linear-progress query color="secondary" class="q-my-sm" rounded />
    </div>
    <!--  -->

    <q-dialog v-model="show_icons" full-height full-width>
      <IconList
        v-if="edit_option === null"
        v-model:model_icon="new_word.homo"
        :icons="icons"
        :phonemes="phonemes"
        @close="show_icons = false"
      ></IconList>

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

    <q-dialog v-model="show_blocks" full-height full-width>
      <BlockList
        v-model:model_block="edit_option.block"
        :blocks="blocks.map((e) => ({ ...e.block, id: e.id }))"
        @close="show_blocks = false"
        @update="(e) => (prefill_block = e)"
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

    <div v-if="preview_word" class="q-pa-md">
      <q-bar
        class="flex justify-between rounded-corners-10"
        style="height: 50px"
      >
        <div class="flex row items-center q-gutter-x-md">
          Preview

          <q-select
            v-model="preview_mode"
            :options="['testing', 'helping']"
            @update:model-value="preview_key++"
            dense
            outlined
          ></q-select>
        </div>

        <strong>{{ preview_word.word }}</strong>
        <q-btn flat icon="mdi-close" @click="preview_word = false"></q-btn>
      </q-bar>

      <PhonicsWord
        ref="word"
        class="fit"
        :word="preview_word"
        :key="preview_word.id + '-' + preview_key"
        :blocks="
          blocks.map((e) => ({
            ...e.block,
            ...{ id: e.id },
          }))
        "
        :mode="preview_mode"
        :look_at_data="undefined"
        :target="undefined"
        :preview_mode="true"
      ></PhonicsWord>
      <!-- @next="next()" -->
      <!-- @isCorrect="isCorrect" -->
      <!-- @isIncorrect="isIncorrect" -->
    </div>

    <q-table
      :columns="columns"
      :rows="word_rows"
      :filter="filter"
      bordered
      separator="cell"
      row-key="name"
      :pagination="initialPagination"
    >
      <template v-slot:top>
        <q-input dense outlined color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />
        <q-btn @click="addNew()" no-caps color="green"> Add Word </q-btn>
      </template>

      <template v-slot:body-cell-pattern="props">
        <q-td :props="props">
          <span v-for="(pattern, i) in props.row.word.pattern" :key="i">
            <span v-if="pattern.icon == null">
              <q-icon
                name="mdi-alert-rhombus-outline"
                color="negative"
              ></q-icon>
            </span>
            <span v-else>
              <span v-if="typeof pattern.icon === 'object'">
                <span v-if="pattern.icon.icon_name != undefined">
                  <strong v-if="pattern.input">
                    {{ pattern.icon.label }}
                  </strong>
                  <span v-else> {{ pattern.icon.label }}</span>
                  <span v-if="i < props.row.word.pattern.length - 1">-</span>
                </span>
                <q-icon v-else size="md">
                  <img :src="pattern.icon.src" type="image/svg+xml" />
                </q-icon>
              </span>
              <span v-else>
                <q-icon
                  name="mdi-alert-rhombus-outline"
                  color="negative"
                ></q-icon>
              </span>
            </span>

            <!-- <span v-if="pattern.sound != null">
              <strong v-if="pattern.input">
                {{ pattern.sound.id.split("-")[0] }}</strong
              >
              <span v-else>
                {{ pattern.sound.id.split("-")[0] }}
                <span v-if="pattern.sound.id.split('-')[0] === 'th'">
                  ({{ pattern.sound.id.split("-")[1][0] }})
                </span>
              </span>
              <span v-if="i < props.row.word.pattern.length - 1">-</span>
            </span>
            <span v-else>
              <q-icon
                name="mdi-alert-rhombus-outline"
                color="negative"
              ></q-icon>
            </span> -->
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-iconpattern="props">
        <q-td :props="props">
          <span v-for="(pattern, i) in props.row.word.pattern" :key="'i' + i">
            <span v-if="pattern.icon == null">
              <q-icon
                name="mdi-alert-rhombus-outline"
                color="negative"
              ></q-icon>
            </span>
            <span v-else>
              <span v-if="typeof pattern.icon === 'object'">
                <span v-if="pattern.icon.label == 'TBA'">p</span>
                <span v-else-if="pattern.icon.icon_name != undefined">
                  <component
                    :is="pattern.icon.icon_name"
                    color="green-6"
                    :label="false"
                    :dots="false"
                    :center="true"
                    :scale="true"
                    style="border-radius: 10px; font-size: 40px"
                    class="overflow-hidden"
                  ></component>
                </span>
                <q-icon v-else size="md">
                  <img :src="pattern.icon.src" type="image/svg+xml" />
                </q-icon>
              </span>
              <span v-else>
                <span v-if="!pattern.icon.includes('mdi')">?</span>
                <q-icon
                  v-else
                  size="md"
                  :name="pattern.icon"
                  color="warning"
                ></q-icon>
              </span>
            </span>
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          {{ props.row.word.word }}
          <span
            v-if="
              props.row.homophones != undefined &&
              props.row.homophones.length > 0
            "
          >
            <q-icon name="mdi-alpha-h-circle-outline"></q-icon>
          </span>

          <span
            v-if="props.row.word.pattern.filter((e) => e.input).length !== 1"
          >
            <!-- <span class="text-caption">No Input</span> -->
            <q-icon name="mdi-alert-rhombus-outline" color="negative"></q-icon>
          </span>

          <strong
            v-if="props.row.word.pattern.filter((e) => e.schwa).length > 0"
          >
            ə
          </strong>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="mdi-eye"
            flat
            @click="previewWord(props.row)"
            color="green"
          >
            <q-tooltip>Preview Word</q-tooltip>
          </q-btn>
          <q-btn
            icon="mdi-pencil-outline"
            flat
            @click="editWord(props.row.word, props.row.id)"
          ></q-btn>

          <q-btn
            icon="mdi-close"
            flat
            @click="deleteWord(props.row.id)"
            color="red"
          ></q-btn>

          <!-- <div v-if="view_as === props.row.id">Active</div> -->
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent } from "vue";
// import DexieLogin from "src/components/dexie/DexieLogin.vue";
import { useAccountsStore } from "src/stores/accounts";
import { useObservable, from } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { syncdb } from "src/database/dbCloud";

// import Classroom from "src/components/classrooms/Classroom.vue";
import axios from "axios";

import IconList from "src/components/master/IconList.vue";
import SoundList from "src/components/master/SoundList.vue";
import BlockList from "src/components/master/BlockList.vue";
import PhonemesList from "src/components/master/PhonemesList.vue";

import PhonicsWord from "src/components/phonics/PhonicsWord.vue";

export default defineComponent({
  name: "WordsPage",
  components: {
    IconList,
    SoundList,
    BlockList,
    PhonicsWord,
    PhonemesList,
  },
  props: {
    words: {},
    word_rows: {},
    blocks: {},
    icons: {},
    sounds: {},
    phonemes: {},
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
    };
  },
  data() {
    return {
      edit_id: null,
      // blocks: [],
      units: [],
      new_unit: null,
      new_word: null,
      add_unit: false,
      add_word: false,
      edit_unit: null,
      // unit_rows: [],
      columns: [
        // {
        //   name: "id",
        //   field: "id",
        //   label: "ID",
        //   align: "left",
        // },
        {
          name: "units_count",
          field: "units_count",
          label: "Unit Count",
          align: "left",
        },
        {
          name: "type",
          field: "type",
          label: "Type",
          align: "left",
        },
        {
          name: "block",
          field: "block",
          label: "Block",
          align: "left",
        },

        {
          name: "label",
          field: "label",
          label: "Word",
          sortable: true,
          align: "left",
        },

        {
          name: "pattern",
          field: "pattern",
          label: "Sound Pattern",
          sortable: true,
          align: "left",
        },

        {
          name: "iconpattern",
          field: "iconpattern",
          label: "Icon Pattern",
          sortable: true,
          align: "left",
        },

        {
          name: "actions",
          field: "actions",
          label: "Actions",
          align: "center",
        },
      ],
      initialPagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 20,
        // rowsNumber: xx if getting data from a server
      },

      edit_pattern: null, //id for edit pattern
      pattern_template: {
        letters: "...",
        input: false,
        icon: "",
        sound: null,
        block: null,
        exclude: [],
        correct: "", // for spelling type..
        schwa: false,
        silent: false,
      },
      edit_word: false,
      word_types: [
        "sound",
        "spelling",
        { label: "something else", disable: true },
      ],
      word_template: {
        id: 0,
        word: "",
        icon: "",
        block: null, // ay, etc..
        correct: "",
        type: "sound",
        pattern: [
          // {
          //   letters: "ai",
          //   input: true,
          //   icon: "mdi-snail",
          //   sound: null,
          //   block: null,
          //   exclude: [],
          //   correct: "",
          // },
          // {
          //   letters: "d",
          //   input: false,
          //   icon: "mdi-dog-side",
          //   sound: null,
          //   block: null,
          //   exclude: [],
          //   correct: "",
          // },
        ],
        homo: null,
        sound: null,
        dictations: [],
        homophones: [],
        use_tense: false,
      },
      prefill_block: null,
      prefill_type: "sound",
      edit_option: null,
      show_icons: false,
      show_sounds: false,
      show_blocks: null,
      show_phonemes: false,
      //
      dictation: "",
      add_dictation: false,
      //
      homophone: "",
      add_homophone: false,
      //
      preview_word: false,
      preview_mode: "testing",
      preview_key: 0,
      //
      filter: "",
      operation: false,
      //
      word_exists: false,
      existing_words: [],
      //
      word_phonemes: "",
      word_letters: "",
    };
  },
  mounted() {
    // this.getBlocks();
    // this.getBlocksAPI();
    // this.getUnits();
    // this.getUnitsAPI();
    // this.testAPI(); //testing public_test
    // this.addNew();
  },

  methods: {
    addNew() {
      if (this.add_word) {
        this.cancelNew();
      } else {
        this.add_word = true;
        this.new_word = JSON.parse(
          JSON.stringify({
            ...this.word_template,
            ...{ block: this.prefill_block, type: this.prefill_type },
          })
        );
      }
    },

    cancelNew() {
      this.add_word = false;
      this.edit_id = null;
      this.new_word = null;
      this.edit_pattern = null;
      this.edit_icon = null;
      this.edit_word = false;
    },

    editWord(word, item_id) {
      // console.log("item_id", item_id);
      // console.log("unit", unit);
      // console.log("word", word);
      this.edit_id = item_id;
      this.new_word = { ...this.word_template, ...word };
      this.add_word = true;

      // this.new_word = word;
      // this.edit_word = true;
      // this.add_word = true;
    },
    removeWord(idx) {
      // this.new_unit.words.splice(idx, 1);
    },

    editWordPattern(idx) {
      if (this.edit_pattern === idx) {
        this.edit_pattern = null;
      } else {
        this.edit_pattern = idx;
      }
    },
    removePattern(idx) {
      this.new_word.pattern.splice(idx, 1);
    },
    addPattern() {
      this.new_word.pattern.push(
        JSON.parse(
          JSON.stringify({
            ...this.pattern_template,
            // ...{ block: this.prefill_block }, // add's to all words we just want for input..
          })
        )
      );
    },

    editUnit(unit, item_id) {
      // console.log("item_id", item_id);
      // console.log("unit", unit);
      this.edit_id = item_id;
      this.new_unit = unit;
      this.add_unit = true;
    },

    addHomoIcon(new_word) {
      this.show_icons = true;
      this.edit_option = null;
    },
    addOptionIcon(option) {
      this.show_icons = true;
      this.edit_option = option;
    },

    addOptionSound(option) {
      this.show_sounds = true;
      this.edit_option = option;
    },

    addOptionBlock(option) {
      this.show_blocks = true;
      this.edit_option = option;
    },

    addOptionPhoneme(option) {
      this.show_phonemes = true;
      this.edit_option = option;
    },

    async addWord() {
      this.operation = true;
      let realmId = "rlm-public";

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      // let token = this.accounts.currentUser.accessToken;
      let token = await this.getGlobalToken();
      // console.log("token", token);
      // let token =
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyaGRnYzRpNXE5NXZ1aW9nQGRleGllLmNsb3VkIiwic2NvcGVzIjpbIkFDQ0VTU19EQiIsIklNUEVSU09OQVRFIiwiTUFOQUdFX0RCIiwiR0xPQkFMX1JFQUQiLCJHTE9CQUxfV1JJVEUiXSwidXNlclR5cGUiOiJjbGllbnQiLCJsaWNlbnNlIjoib2siLCJybCI6InByb2QiLCJpYXQiOjE3MDY1MDU1NjcsIm5iZiI6MTcwNjUwNTI2NywiZXhwIjoxNzA2NTA5MTY3LCJhdWQiOlsiaHR0cHM6Ly96NXc5eHF3ZmQuZGV4aWUuY2xvdWQiLCJ6NXc5eHF3ZmQiXSwiaXNzIjoiaHR0cHM6Ly9kZXhpZS5jbG91ZCJ9.GQ4AQEdQUmlvt7RBsoPIiHctAvNgHsQgfDIiNXp-VfA";

      // this.new_unit.id = this.units.length + 1;
      this.prefill_block = this.new_word.block;
      this.prefill_type = this.new_word.type;

      let item = {
        region: "AU",
        unit_ids: [],
        word: this.new_word,
        // realmId: realmId,
      };

      let edit_mode = this.edit_id === null ? false : true;
      if (edit_mode) {
        item.id = this.edit_id;

        let word = this.words.find((e) => e.id === item.id);
        item.region = word.region;
        item.unit_ids = word.unit_ids;

        let deleted = await this.deleteWord(item.id);
        if (!deleted) {
          return;
        }
        this.updateUnits(item);
      }

      // ..bring await back alter
      await axios
        // axios
        .post(`${base_url}/public/words`, item, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("response", response);
          //
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });

      this.cancelNew();
      // this.getUnitsAPI();
      this.$emit("refresh");
      this.operation = false;
    },
    async deleteWord(id) {
      if (this.edit_id === null) {
        var result = confirm("Are you sure you want to delete this word?");
      } else {
        var result = true;
      }
      if (result) {
        this.operation = true;
        let dbid = process.env.DBID;
        let base_url = `https://${dbid}.dexie.cloud`;
        let token = await this.getGlobalToken();
        // let token =
        //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyaGRnYzRpNXE5NXZ1aW9nQGRleGllLmNsb3VkIiwic2NvcGVzIjpbIkFDQ0VTU19EQiIsIklNUEVSU09OQVRFIiwiTUFOQUdFX0RCIiwiR0xPQkFMX1JFQUQiLCJHTE9CQUxfV1JJVEUiXSwidXNlclR5cGUiOiJjbGllbnQiLCJsaWNlbnNlIjoib2siLCJybCI6InByb2QiLCJpYXQiOjE3MDY1MDU1NjcsIm5iZiI6MTcwNjUwNTI2NywiZXhwIjoxNzA2NTA5MTY3LCJhdWQiOlsiaHR0cHM6Ly96NXc5eHF3ZmQuZGV4aWUuY2xvdWQiLCJ6NXc5eHF3ZmQiXSwiaXNzIjoiaHR0cHM6Ly9kZXhpZS5jbG91ZCJ9.GQ4AQEdQUmlvt7RBsoPIiHctAvNgHsQgfDIiNXp-VfA";

        let deleted = false;
        await axios
          .delete(`${base_url}/public/words/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(function (response) {
            console.log("deleted ", response);
            deleted = true;
          })
          .catch(function (error) {
            console.log("error", error);
            // return undefined;
            deleted = false;
          });

        if (deleted) {
          this.$emit("removeWord", id);
        }
        this.operation = false;
        return deleted;
      }
    },
    async getGlobalToken() {
      let base_url = "https://z5w9xqwfd.dexie.cloud";
      // console.log("this.account", this.accounts.currentUser);
      // let token = this.accounts.currentUser.accessToken;
      let client_id = process.env.clientId;
      let client_secret = process.env.clientSecret;

      let token = null;
      await axios
        .post(`${base_url}/token`, {
          // params: {
          grant_type: "client_credentials",
          scopes: [
            "ACCESS_DB",
            "IMPERSONATE",
            "MANAGE_DB",
            "GLOBAL_READ",
            "GLOBAL_WRITE",
            // "DELETE_DB",
          ],
          client_id: client_id,
          client_secret: client_secret,
          // claims: {
          //   sub: "flipdav8@gmail.com",
          //   email: "flipdav8@gmail.com",
          //   name: "flipdav8@gmail.com",
          // },
          // },
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          // console.log("response", response);
          token = response.data.accessToken;
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
      return token;
    },

    // updates the word in units... maybe better to use word_ids in unit instead?
    async updateUnits(item) {
      console.log("updated word .. now to units", item);

      let unit_ids = item.unit_ids;

      let remove_unit_ids = [];
      // remove unit_id from item.. do later.. will have to put an await before this method.

      for (let idx = 0; idx < unit_ids.length; idx++) {
        const unit_id = unit_ids[idx];
        const unit = await this.getUnit(unit_id);
        if (unit == undefined) {
          //unit has been deleted...
        } else {
          console.log("unit", unit);
          let unit_words = unit.unit.words;
          let unit_replace = unit_words.findIndex((e) => e.id === item.id);
          //note should not have multiple words with the same id in a unit..
          if (unit_replace > -1) {
            let replace_word = { ...item.word, id: item.id };
            unit_words.splice(unit_replace, 1, replace_word);
            console.log("unit_words", unit_words);
            this.updateUnit({
              ...unit,
              ...{ unit: { ...unit.unit, ...{ words: unit_words } } },
            });
          } else {
            // word has been deleted from unit at some point..
          }
        }
      }
    },
    async getUnit(id) {
      try {
        return await syncdb.units.get(id);
      } catch (error) {
        let status = `Failed to read units: ${error}`;
        console.log("status error", status);
        return null;
      }
    },
    async updateUnit(item) {
      let deleted = await this.deleteUnit(item.id);
      if (!deleted) {
        return;
      }

      console.log("updated unit item", item);

      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      let token = await this.getGlobalToken();

      await axios
        .post(`${base_url}/public/units`, item, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("response updated unit", response);
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
        });
    },
    async deleteUnit(id) {
      let dbid = process.env.DBID;
      let base_url = `https://${dbid}.dexie.cloud`;
      let token = await this.getGlobalToken();

      let deleted = false;
      await axios
        .delete(`${base_url}/public/units/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(function (response) {
          console.log("deleted ", response);
          deleted = true;
        })
        .catch(function (error) {
          console.log("error", error);
          // return undefined;
          deleted = false;
        });

      if (deleted) {
        this.$emit("removeUnit", id);
      }
      this.operation = false;
      return deleted;
    },

    previewWord(word) {
      // TBA
      this.preview_word = word.word;
      this.preview_key++;
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

      if (check !== false) {
        // this.new_word.past
        this.word_exists = true;
        this.existing_words = check;
      }
    },

    updateInput(option) {
      // console.log("option", option);
      if (option.input) {
        option.block = this.prefill_block;
      } else {
        option.block = null;
      }
    },

    clearSounds() {
      this.new_word.pattern.forEach(function (w) {
        w.sound = null;
      });
    },

    clearBlocks() {
      // for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
      //   const w = this.new_word.pattern[idx];
      //   if (!w.input  && w.block != null) {
      //     w.block = null;
      //   }
      // }
      this.new_word.pattern.forEach(function (w) {
        if (w.input === false && w.block != null) {
          w.block = null;
        }
      });
    },

    makePatternFromWordV2() {
      if (this.new_word.pattern.length > 0) return;
      let split = this.word_letters.split(/(\s+)/).filter(function (e) {
        return e.trim().length > 0;
      });

      for (let idx = 0; idx < split.length; idx++) {
        const letter = split[idx];
        this.pattern_template.letters = letter;
        this.addPattern();
      }

      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const pattern = this.new_word.pattern[idx];
        this.guessPhoneme(pattern, pattern.letters);
      }
    },

    guessPhonemes() {
      // console.log("word_ponemes", this.word_phonemes.split(/(\s+)/));
      let split_p = this.word_letters.split(/(\s+)/).filter(function (e) {
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
      }
    },

    selectPriorWord(word) {
      this.new_word.pattern = JSON.parse(JSON.stringify(word.word.pattern));

      for (let idx = 0; idx < this.new_word.pattern.length; idx++) {
        const element = this.new_word.pattern[idx];
        element.input = false;
        element.block = null;
      }
    },
  },
});
</script>
<style>
.my-pill {
  border: solid 1px;
  border-radius: 10px;
  padding: 20px;
}
</style>
