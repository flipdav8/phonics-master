import {
  defineComponent
} from "vue";
import {
  useAccountsStore
} from "src/stores/accounts";
import {
  syncdb
} from "src/database/dbCloud";
import axios from "axios";
import BLOCKS from "src/components/master/blocks/blocks.json";

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
        {
          label: "something else",
          disable: true
        },
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
      bulk_mode: false,
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
            ...{
              block: this.prefill_block,
              type: this.prefill_type
            },
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
      this.new_word = {
        ...this.word_template,
        ...word
      };
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
            ...{
              input: true,
              block: this.new_word.block
            },
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
            let replace_word = {
              ...item.word,
              id: item.id
            };
            unit_words.splice(unit_replace, 1, replace_word);
            console.log("unit_words", unit_words);
            this.updateUnit({
              ...unit,
              ...{
                unit: {
                  ...unit.unit,
                  ...{
                    words: unit_words
                  }
                }
              },
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
      let bulk = this.WORDS.filter(
        (e, i) => e.unit == this.bulk_block.label.split("_")[1]
      );

      let phoneme_label = this.bulk_block_strip_label;

      let words = [];
      for (let idx = 0; idx < bulk.length; idx++) {
        const word = bulk[idx];
        let pattern = [];
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

            if (p_label === phoneme_label) {
              input = true;
              block["id"] = input_block_id;
            }
          }
          let pat = {
            letters: chars,
            input: input,
            icon: icon,
            // sound: null,
            block: block,
            exclude: [],
            correct: "", // for spelling type..
            schwa: p_label === "schwa" ? true : false,
            silent: false,
          };

          pattern.push(pat);
        }

        let hom = null;
        let homophones = [];
        if (word.hom) {
          let strip_word = word.raw_word.replaceAll("!", "");
          // console.log("this.homophones", this.homophones, word.raw_word);
          let matching_homophones = this.homophones.filter((e) => e.label.toLocaleLowerCase().includes(strip_word.toLocaleLowerCase()));
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

          let unit_block = this.BLOCKS.find((e) => e.unit_no === word.unit);
          if (unit_block !== undefined && unit_block.homs !== undefined) {
            let search_homs = await this.findHomophones(strip_word);
            console.log("search_homs", search_homs);



            // console.log("unit_homs", unit_block.homs);
          }

          homophones.push("placeholder!");
        }

        let warning = false;
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
          warning: warning,
        });
      }

      console.log("words", words);
      this.bulk_words = words;

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
    },
    async addBulk() {
      return;
      let bulk_blocks = BLOCKS.filter(
        (e) => e.label !== undefined && e.type === type
      );

      let bulk_items = [];
      for (let index = 0; index < bulk_blocks.length; index++) {
        const block = bulk_blocks[index];
        if (this.blocks.find((e) => e.block.label === block.label)) {
          // console.log("already entered", block.label);
          continue;
        }

        let label = block.label + "_" + block.unit_no;
        if (this.blocks.find((e) => e.block.label === label)) {
          continue;
        }

        let icon = null;
        if (type === "sound") {
          let split = label.split("/");
          let ph = "";
          ph = split[1];
          if (split.join("").includes("moon")) {
            ph = "oo-moon";
          }

          if (split.join("").includes("book")) {
            ph = "oo-book";
          }

          if (split.join("").includes("o-oo")) {
            ph = "o-oo";
          }

          if (split.join("").includes("tools")) {
            ph = "o-tools";
          }

          let phoneme = this.phonemes.find((e) => e.label === ph);
          if (phoneme !== undefined) {
            // console.log("phoneme", phoneme);
            icon = {
              id: phoneme.id,
              label: phoneme.label,
              icon_name: phoneme.icon_name,
              sound_src: phoneme.sound_src,
            };
          } else {
            console.log("no phoneme", block);
          }
        }

        let block_template = {
          id: block.unit_no,
          label: label,
          type: type,
          icon: icon,
          sound: null,
          options: [],
        };

        // option_template: { label: "ay", sound: null, icon: null },
        let all_options = block.options;
        let dual_sounds = false;
        for (let ii = 0; ii < all_options.length; ii++) {
          const option_label = all_options[ii];

          let option_icon = null;

          if (type === "spelling") {
            let option_ph = option_label;
            if (option_label.includes("moon")) {
              option_ph = "oo-moon";
            }

            if (option_label.includes("book")) {
              option_ph = "oo-book";
            }

            if (option_label.includes("o-oo")) {
              option_ph = "o-oo";
            }

            if (option_label.includes("tools")) {
              option_ph = "o-tools";
            }

            let phoneme = this.phonemes.find((e) => e.label === option_ph);

            if (phoneme !== undefined) {
              // console.log("phoneme", phoneme);
              option_icon = {
                id: phoneme.id,
                label: phoneme.label,
                icon_name: phoneme.icon_name,
                sound_src: phoneme.sound_src,
              };
            } else {
              console.log("no phoneme", block);
              dual_sounds = true;
            }
          }

          block_template.options.push({
            label: option_label,
            sound: null,
            icon: option_icon,
          });
        }

        if (type === "spelling" && dual_sounds) {
          block_template["dual_sounds"] = true;
        }

        bulk_items.push({
          region: "AU",
          block: block_template,
        });
      }

      // console.log("add these blocks", bulk_items);
      return;

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
  },
});
