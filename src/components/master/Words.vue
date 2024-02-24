<template>
  <!-- non-selectable -->
  <div class="fit q-pa-md">
    <div class="text-caption q-pa-sm class flex row">
      <q-btn
        no-caps
        flat
        @click="loadBulk()"
        :disable="bulk_block == null || bulk_mode"
        >Load Bulk</q-btn
      >
      <q-select
        class="q-col-4"
        outlined
        v-model="bulk_type"
        :options="['sound', 'spelling']"
      ></q-select>
      <q-btn no-caps flat @click="show_bulk_block = !show_bulk_block">
        Pick Block
        <span v-if="bulk_block != null">
          {{ bulk_block.label }}
        </span>
      </q-btn>
    </div>

    <q-card v-if="load_bulk && !add_word">
      <q-card-section>
        <q-btn @click="addBulk()">Add Bulk</q-btn>
        <!-- {{ bulk_block.label.split("_")[1] }} -->

        <div
          v-for="(bulk_word, i) in bulk_words"
          :key="i"
          class="flex row justify-around"
        >
          <div class="flex row items-center">
            {{ bulk_word.word }}
          </div>
          <div class="flex row">
            <div v-for="(p, ii) in bulk_word.pattern" :key="ii">
              <strong v-if="p.input">
                {{ p.letters }}
              </strong>
              <span v-else>{{ p.letters }}</span>
              <span v-if="ii < bulk_word.pattern.length - 1" class="q-mx-sm"
                >-
              </span>
            </div>
          </div>

          <div class="flex row">
            <div v-for="(p, ii) in bulk_word.pattern" :key="ii">
              <span v-if="p.icon == null">
                <q-icon
                  name="mdi-alert-rhombus-outline"
                  color="negative"
                ></q-icon>
              </span>
              <span v-else>
                <span v-if="typeof p.icon === 'object'">
                  <span v-if="p.icon.icon_name != undefined">
                    <component
                      :is="p.icon.icon_name"
                      :color="p.input ? 'green' : 'grey-10'"
                      :label="false"
                      :dots="false"
                      :center="true"
                      :scale="true"
                      style="border-radius: 10px; font-size: 40px"
                      class="overflow-hidden"
                    ></component>
                    <span v-if="ii < bulk_word.pattern.length - 1">-</span>
                  </span>
                  <span v-else> ? </span>
                </span>
                <span v-else>
                  <q-icon
                    name="mdi-alert-rhombus-outline"
                    color="negative"
                  ></q-icon>
                </span>
              </span>
            </div>
          </div>

          <div class="flex row items-center">
            <span
              v-if="bulk_word.homo != null && bulk_word.homo.name !== undefined"
            >
              <q-icon size="lg">
                <img
                  :src="`/homophone-icons/${bulk_word.homo.src}.svg`"
                  type="image/svg+xml"
                />
              </q-icon>
            </span>
            <q-btn flat no-caps @click="editBulkWord(bulk_word)">Edit</q-btn>

            <q-icon
              v-if="bulk_words_info[i].should_be_hom"
              name="mdi-alpha-h-circle-outline"
              color="black"
            ></q-icon>

            <q-icon
              v-if="
                bulk_words_info[i].should_be_hom &&
                (bulk_word.homo == null ||
                  (bulk_words_info[i].missing_hom &&
                    bulk_word.homophones.length < 1))
              "
              name="mdi-alpha-h-circle-outline"
              color="red"
            ></q-icon>

            <q-icon
              v-if="bulk_words_info[i].bonus_homophones.length > 0"
              name="mdi-alpha-h-circle-outline"
              color="blue"
            ></q-icon>

            <q-icon
              v-if="bulk_words_info[i].input_count !== 1"
              name="mdi-greater-than-or-equal"
              color="purple"
            ></q-icon>

            <div v-if="bulk_words_info[i].warning">
              <q-icon name="mdi-alert" color="purple"></q-icon>
            </div>

            <q-checkbox
              v-model="bulk_word.skip"
              checked-icon="mdi-close"
              unchecked-icon="mdi-check"
              indeterminate-icon="mdi-check"
              size="xs"
            ></q-checkbox>

            <div v-if="bulk_words_info[i].check_exists.length > 0">
              <q-btn
                flat
                no-caps
                @click="bulkExists(bulk_words_info[i].check_exists, i)"
                >Exists</q-btn
              >
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- WORD -->
    <!-- <EditWord
      v-if="add_word && !operation"
      :input_word="new_word"
      :edit_id="edit_id"
      v-model:prefill_block="prefill_block"
      :icons="icons"
      :sounds="sounds"
      :phonemes="phonemes"
      :homophones="homophones"
      :words="words"
      :word_rows="word_rows"
      :blocks="blocks"
      :bulk_mode="bulk_mode"
      @cancel="cancelNew"
      @addWord="addWord"
    >
    </EditWord> -->

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
          {{ edit_id === null ? "Add New Word" : "Apply Changes" }}
        </q-btn>
      </q-card-section>
    </q-card>

    <div v-if="operation">
      <q-linear-progress query color="secondary" class="q-my-sm" rounded />
    </div>
    <!--  -->

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

    <q-dialog v-model="word_exists">
      <div class="flex column q-gutter-sm">
        <q-card
          v-for="(word, i) in existing_words"
          :key="i"
          @click="selectPriorWord(word)"
          class="cursor-pointer"
          :class="{
            disabled: word.word.type !== bulk_type,
            'no-pointer-events': word.word.type !== bulk_type,
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

    <q-dialog v-model="show_bulk_block" full-height full-width>
      <BlockList
        v-model:model_block="bulk_block"
        :blocks="blocks.map((e) => ({ ...e.block, id: e.id }))"
        @close="show_bulk_block = false"
        @update="bulkBlockPicked"
        :filter_type="bulk_type"
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
        <q-btn @click="addNew()" no-caps color="green" :disable="bulk_mode">
          Add Word
        </q-btn>
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

          <q-btn flat @click="copyToClip(props.row.word.pattern)">Copy</q-btn>
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
                    :color="pattern.input ? 'green-6' : 'grey-8'"
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

      <template v-slot:body-cell-homophones="props">
        <q-td :props="props">
          <span v-if="props.row.homophones > 0">
            <q-icon name="mdi-alpha-h-circle-outline"></q-icon>
          </span>
          <span> {{ props.row.homophones }}</span>
          <span v-if="props.row.homophones > 0">
            <span v-if="props.row.word.homo == null">
              <q-icon
                name="mdi-alert-rhombus-outline"
                color="negative"
                size="md"
              ></q-icon>
            </span>

            <span
              v-if="
                props.row.word.homo !== null &&
                props.row.word.homo.name == undefined
              "
            >
              <q-icon
                name="mdi-alert-rhombus-outline"
                color="warning"
                size="md"
              ></q-icon>
            </span>
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-label="props">
        <q-td :props="props">
          {{ props.row.word.word }}

          <span
            v-if="props.row.word.pattern.filter((e) => e.input).length !== 1"
          >
            <!-- <span class="text-caption">No Input</span> -->
            <q-icon name="mdi-alert-rhombus-outline" color="negative"></q-icon>
          </span>

          <!-- <strong
            v-if="props.row.word.pattern.filter((e) => e.schwa).length > 0"
          >
            ə
          </strong> -->

          <!-- <strong
            v-if="
              props.row.word.pattern.filter((e) => e.schwa).length < 1 &&
              props.row.word.pattern.filter(
                (e) => e.icon != null && e.icon.label == 'schwa'
              ).length > 0
            "
          >
            <q-icon name="mdi-alert" color="negative" size="md"></q-icon> ə
          </strong> -->

          <!-- <span
            v-if="
              props.row.word.pattern.filter((e) => e.sound != null).length > 0
            "
          >
            <q-icon name="mdi-alert" color="negative" size="md"></q-icon>
          </span> -->
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
import HomophonesList from "src/components/master/HomophonesList.vue";
import SoundList from "src/components/master/SoundList.vue";
import BlockList from "src/components/master/BlockList.vue";
import PhonemesList from "src/components/master/PhonemesList.vue";

import PhonicsWord from "src/components/phonics/PhonicsWord.vue";

import WORDS from "src/components/master/words/unit-words.json";
import BLOCKS from "src/components/master/blocks/blocks.json";

import EditWord from "./words/EditWord.vue";

import { copyToClipboard } from "quasar";

export default defineComponent({
  name: "WordsPage",
  components: {
    IconList,
    SoundList,
    BlockList,
    PhonicsWord,
    PhonemesList,
    HomophonesList,
    EditWord,
  },
  props: {
    words: {},
    word_rows: {},
    blocks: {},
    icons: {},
    sounds: {},
    phonemes: {},
    homophones: {},
  },
  setup() {
    const accounts = useAccountsStore();
    return {
      accounts,
      WORDS,
      BLOCKS,
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
        // {
        //   name: "units_count",
        //   field: "units_count",
        //   label: "Unit Count",
        //   align: "left",
        // },
        {
          name: "homophones",
          field: "homophones",
          label: "homophones",
          sortable: true,
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
        icon: null,
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
        plural: false,
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

      load_bulk: false,
      show_bulk_block: false,
      bulk_type: "sound",
      bulk_block: null,
      bulk_block_strip_label: "",
      bulk_words: [],
      bulk_words_info: [],
      bulk_mode: false,
      bulk_exists: [],
      bulk_exist_index: null,
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

      this.word_phonemes = "";
      this.word_letters = "";
    },

    editWord(word, item_id) {
      // console.log("item_id", item_id);
      // console.log("unit", unit);
      console.log("word", word);
      this.edit_id = item_id;
      this.new_word = { ...this.word_template, ...word };
      this.add_word = true;
      window.scrollTo(0, 0);

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
    addPattern(make_input) {
      let pattern_object;

      if (make_input != undefined) {
        pattern_object = JSON.parse(
          JSON.stringify({
            ...this.pattern_template,
            ...{ input: true, block: this.new_word.block },
          })
        );
      } else {
        pattern_object = JSON.parse(
          JSON.stringify({
            ...this.pattern_template,
            // ...{ block: this.prefill_block }, // add's to all words we just want for input..
          })
        );
      }
      this.new_word.pattern.push(pattern_object);
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
      if (this.bulk_mode) {
        this.bulk_mode = false;
        // console.log("edit bulk_word", this.new_word);
        // console.log("bulk words", this.bulk_words);
        this.cancelNew();
        return;
      }
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

      if (check !== false && check.length > 0) {
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
      if (this.bulk_mode) {
        let edit_word = this.bulk_words[this.bulk_exist_index];
        edit_word.pattern = JSON.parse(JSON.stringify(word.word.pattern));
        edit_word.homophone;
        edit_word.type = word.word.type;
        edit_word.homo = word.word.homo;
        edit_word.homophones = word.word.homophones;
        edit_word.use_tense = word.word.use_tense;
        edit_word.plural = word.word.plural;

        // this.bulk_words.splice(this.bulk_exist_index, 1, word.word);
        // console.log("splice here", this.bulk_words);
        return;
      }
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

    async loadBulk() {
      this.bulk_mode = !this.bulk_mode;

      if (!this.bulk_mode) return;

      let bulk = this.WORDS.filter(
        (e, i) => e.unit == this.bulk_block.label.split("_")[1]
      );

      let phoneme_label = this.bulk_block_strip_label;

      let words = [];
      let words_info = [];

      let all_homophones = [];
      let all_bonus_homophones = [];

      let unit_block = this.BLOCKS.find((e) => e.unit_no === bulk[0].unit);
      if (unit_block.homs !== undefined) {
        console.log("unit_homs", unit_block.homs);
      }
      let { direct, indirect, delay } = unit_block.homs;
      let all_unit_homophones = [...direct, ...indirect, ...delay];

      let block_options = this.blocks.find((e) => e.id === this.bulk_block.id)
        .block.options;

      for (let idx = 0; idx < bulk.length; idx++) {
        const word = bulk[idx];

        //check if exists..
        let check_exists = await syncdb.words
          .where("word.word")
          .equals(word.raw_word)
          .toArray();

        let pattern = [];
        let warning = false;
        let input_count = 0;
        for (let ii = 0; ii < word.letter_pattern.length; ii++) {
          const chars = word.letter_pattern[ii];
          const p_label = word.label_pattern[ii];

          const pattern_phoneme = this.phonemes.find(
            (e) => e.label === p_label
          );
          const input_block_id = this.bulk_block.id;
          let icon = null;
          let block = null;
          let input = false;
          let correct = "";

          if (pattern_phoneme !== undefined) {
            icon = {
              id: pattern_phoneme.id,
              label: pattern_phoneme.label,
              icon_name: pattern_phoneme.icon_name,
              sound_src: pattern_phoneme.sound_src,
            };
            block = {
              label: pattern_phoneme.label,
            };

            if (this.bulk_type == "spelling") {
              // if (phoneme_label.includes(',')) {

              //   let split_label =
              // }
              // block.label = phoneme_label; // doesn't matter so mcu
              if (chars === phoneme_label) {
                input = true;
                block["id"] = input_block_id;
                input_count++;

                // console.log("block_options", block_options);
                let set_correct = block_options.find(
                  (e) => e.label === pattern_phoneme.label
                );
                if (set_correct !== undefined) {
                  correct = set_correct.label;
                } else {
                  warning = true;
                }

                // correct = this.bulk_block.options,
              }
            } else if (this.bulk_type == "sound") {
              if (p_label === phoneme_label) {
                input = true;
                block["id"] = input_block_id;
                input_count++;
              }
            }
          }

          let pat = {
            letters: chars,
            input: input,
            icon: icon,
            // sound: null,
            block: block,
            exclude: [],
            correct: correct, // for spelling type..
            schwa: p_label === "schwa" ? true : false,
            silent: false,
          };

          pattern.push(pat);
        }

        let hom = null;
        let homophones = [];
        let bonus_homophones = [];
        let strip_word = word.raw_word.replaceAll("!", "");
        let should_be_hom = false;
        let missing_hom_flag = false;
        //Homophon section
        if (word.hom || all_unit_homophones.includes(strip_word)) {
          should_be_hom = true;

          // console.log("this.homophones", this.homophones, word.raw_word);
          let matching_homophones = this.homophones.filter((e) =>
            e.label.toLocaleLowerCase().includes(strip_word.toLocaleLowerCase())
          );

          if (matching_homophones.length > 0) {
            // console.log("matching_homophones", matching_homophones);
            let final_match = matching_homophones.find(
              (e) => e.label === strip_word.toLocaleLowerCase()
            );
            if (final_match != undefined) {
              hom = {
                src: `${final_match.value.split("/")[0]}/${final_match.label}`,
                label: final_match.label,
                name: final_match.value,
                id: final_match.id,
              };
            }
          }

          if (unit_block !== undefined && unit_block.homs !== undefined) {
            let search_homs = await this.findHomophones(strip_word);
            let search_map = search_homs.map((e) => e.word);
            console.log(`search_homs for ${strip_word}`, search_homs);

            let { direct, indirect, delay } = unit_block.homs;
            for (let xx = 0; xx < direct.length; xx++) {
              const element = direct[xx];
              if (search_map.includes(element)) {
                homophones.push(element);
              }
            }

            for (let xx = 0; xx < indirect.length; xx++) {
              const element = indirect[xx];
              if (search_map.includes(element)) {
                homophones.push(element);
              }
            }

            for (let xx = 0; xx < delay.length; xx++) {
              const element = delay[xx];
              if (search_map.includes(element)) {
                homophones.push(element + "!");
              }
            }

            let filter_search_homs = search_homs
              .filter((e) => e.score > 900)
              .map((e) => e.word);

            for (let xx = 0; xx < filter_search_homs.length; xx++) {
              const element = filter_search_homs[xx];
              if (
                !homophones.map((e) => e.replaceAll("!", "")).includes(element)
              ) {
                bonus_homophones.push(element);
              }
            }
            all_bonus_homophones.push({
              word: strip_word,
              bonus: bonus_homophones,
            });

            console.log(`homs for ${strip_word}`, homophones);

            all_homophones.push(...homophones);
            if (homophones.length < 1) {
              missing_hom_flag = true;
            }
          }
          // homophones.push("placeholder!");
        } else {
          let search_homs = await this.findHomophones(strip_word);
          bonus_homophones = search_homs
            .filter((e) => e.score > 900)
            .map((e) => e.word);
          all_bonus_homophones.push({
            word: strip_word,
            bonus: bonus_homophones,
          });
        }

        if (word.letter_pattern.length !== word.label_pattern.length) {
          warning = true;
        }

        words.push({
          id: word.i,
          word: word.raw_word.replaceAll("!", ""),
          // icon: "",
          block: {
            id: this.bulk_block.id,
            label: this.bulk_block.label,
          }, // ay, etc..
          // correct: "",
          type: this.bulk_type,
          pattern: pattern,
          homo: hom,
          sound: null,
          dictations: [],
          homophones: homophones,
          use_tense: false,
          plural: false,
        });
        words_info.push({
          should_be_hom: should_be_hom,
          missing_hom: missing_hom_flag,
          warning: warning,
          bonus_homophones: bonus_homophones,
          input_count: input_count,
          check_exists: check_exists,
        });
      }

      let missing_homophones = [];
      console.log("all_homophones", all_homophones);
      let check_homs = [...indirect, ...delay];
      for (let xx = 0; xx < check_homs.length; xx++) {
        const element = check_homs[xx].replaceAll("!", "");
        if (
          !all_homophones.map((e) => e.replaceAll("!", "")).includes(element)
        ) {
          missing_homophones.push(element);
        }
      }

      let filter_missing = missing_homophones;
      if (filter_missing.length > 0) {
        console.log("missing homophones", filter_missing);
        alert("missing homophones");
      }

      console.log("all bonus homs", {
        unit: bulk[0].unit,
        list: all_bonus_homophones.filter((e) => e.bonus.length > 0),
      });

      // console.log("words", words);
      this.bulk_words = words;
      this.bulk_words_info = words_info;

      this.load_bulk = !this.load_bulk;
    },

    async findHomophones(word) {
      let vm = this;
      let homs = [];
      await axios
        // .get(`https://api.datamuse.com/words?sl=${this.word_search}`, {
        .get(`https://api.datamuse.com/words?rel_hom=${word}&md=dpsrf`)
        .then(function (response) {
          homs = response.data;
        })
        .catch(function (error) {
          console.log("error", error);
        });

      return homs;
    },

    bulkBlockPicked(e) {
      this.prefill_block = e;
      if (this.bulk_type === "sound") {
        let split = e.label.split("/");
        let label = "";
        label = split[1];
        if (split.join("").includes("moon")) {
          label = "oo-moon";
        }

        if (split.join("").includes("book")) {
          label = "oo-book";
        }

        if (split.join("").includes("o-oo")) {
          label = "o-oo";
        }

        if (split.join("").includes("tools")) {
          label = "oo-tools";
        }

        this.bulk_block_strip_label = label;
      } else {
        let split = e.label.split("<")[1].split(">")[0];
        if (split.includes(">+<")) {
          split.removeAll(">+<", ",");
        }
        let label = split;
        this.bulk_block_strip_label = label;
      }
    },

    bulkExists(words, index) {
      console.log("existing words", words);
      this.existing_words = words;
      this.bulk_exist_index = index;
      this.word_exists = true;
    },

    async addBulk() {
      let bulk_items = this.bulk_words
        .filter((e) => !e.skip || e.skip == undefined)
        .map((e) => ({
          word: e,
          region: "AU",
          unit_ids: [],
        }));
      console.log("add these words", bulk_items);

      // return;

      if (bulk_items.length > 0) {
        // return;

        this.operation = true;
        let dbid = process.env.DBID;
        let base_url = `https://${dbid}.dexie.cloud`;
        let token = await this.getGlobalToken();

        let items = bulk_items;

        await axios
          .post(`${base_url}/public/words`, items, {
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

        this.operation = false;
        console.log("added bulk");
      }
    },

    editBulkWord(bulk_word) {
      this.new_word = bulk_word;
      this.bulk_mode = true;
      this.add_word = true;
    },

    copyToClip(pattern) {
      let copy = "";

      for (let index = 0; index < pattern.length; index++) {
        const element = pattern[index].letters + " ";
        copy = copy + element;
      }

      copy = copy + " ... ";

      for (let index = 0; index < pattern.length; index++) {
        const element = pattern[index].icon.label + " ";
        copy = copy + element;
      }

      copyToClipboard(copy)
        .then(() => {
          // success!
          console.log("copied", copy);
        })
        .catch(() => {
          // fail
        });
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
