import ph from "/src/components/icons/phonemes.js";
const PHONEMES = ph.list;


const orderGraphemes = function orderGraphemes(letters, pids, word) {
  let phonemes = PHONEMES;
  let ordered_letters = [];

  if (letters == undefined) {
    console.log("no letters?", word);
    ordered_letters = [];
  }




  if (letters.length > 1) {
    // console.log("letters", letters);
    //split spellings
    //double letters > other combos

    let vowels = ["a", "e", "i", "o", "u"];
    let touching = [];
    let not_touching = [];

    let array = JSON.parse(JSON.stringify(letters));

    let exceptions = ['augh']

    let max_count = 0;
    let max_pref = 0;

    let prefs = [
      { g: 'gh', ph_label: 'f' },
      { g: 'eigh', ph_label: 'ae', break: true }, //for example eight..
      { g: 'eigh', ph_label: 'ie', break: true } //for example height.
    ];
    // let endings =['ed', 'er', 'es']
    let endings = ['se']

    for (let index = 0; index < array.length; index++) {
      const pattern = array[index];
      let touch_array = [];
      let to_first = false;

      let first_count = 0;
      let pref = 0;

      for (let xx = 0; xx < pattern.length; xx++) {
        const graphemes = pattern[xx];

        let pid = pids[xx];

        let phon = phonemes.find(
          (e) => e.list_id.toString() === pid.toString()
        );


        let find_pref = prefs.find((e) => e.g === graphemes && e.ph_label === phon.label);
        if (find_pref !== undefined) {
          pref++;
          touch_array.push(false);
          if (find_pref.break) break;
        }

        //graphemes.length <=3 to avoid au-e etc..
        if (
          (graphemes.includes("-") &&
            !phon.classes.includes("short vowel") && graphemes.length <= 3) ||
          graphemes.includes("^")
        ) {
          touch_array.push(false);
          break;
        }

        if (graphemes.length > 3 && graphemes.includes("-")) {
          // penalises au-e for example
          first_count = -10;
          pref = -10;
        }

        if (word.includes("tion") && graphemes == "ti") {
          touch_array.push(false);
          break;
        }

        if (word.includes("ower") && graphemes == "ow") {
          touch_array.push(false);
          break;
        }

        if (exceptions.includes(graphemes)) {
          to_first = true;
          first_count++
          touch_array.push(false);
          // break;
        }

        if (endings.includes(graphemes)) {
          if (
            word.substring(word.length - graphemes.length, word.length) ===
            graphemes
          ) {
            to_first = true;
            first_count++
            touch_array.push(false);
            // break;
          }
        }

        if (
          word.substring(word.length - 2, word.length) ===
          "er" &&
          graphemes == "er"
        ) {
          to_first = true;
          first_count++
          touch_array.push(false);
          // break;
        }

        if (
          word.substring(word.length - 2, word.length) ===
          "ed" &&
          graphemes == "ed"
        ) {
          to_first = true;
          first_count++
          touch_array.push(false);
          // break;
        }

        let chars = graphemes.split("");

        let char_types = [];

        for (let ww = 0; ww < chars.length; ww++) {
          const char = chars[ww];
          if (vowels.includes(char)) {
            char_types.push("v");
            if (phon.classes.includes("vowel")) {
              to_first = true;
              first_count++
            }
          } else {
            char_types.push("c");
          }
        }

        if (char_types.includes("v") && char_types.includes("c")) {
          if (
            chars[chars.length - 1] === "r" &&
            phon.classes.includes("r-separated")
          ) {
            touch_array.push(false);
          } else {

            touch_array.push(true);

          }
          //TODO if h followed by a vowel .. then to_first
        } else {
          touch_array.push(false);
        }
      }


      if (touch_array.filter((e) => e).length > 0) {
        if (to_first) {
          if (first_count > max_count) {
            max_count = first_count;
            touching.unshift(pattern);
          } else {
            touching.push(pattern);
          }
        } else {
          touching.push(pattern);
        }
      } else {
        if (pref > max_pref) {
          max_pref = pref;
          not_touching.unshift(pattern);
        } else if (to_first) {
          if (pref > max_pref) {
            max_pref = pref;
            not_touching.unshift(pattern);
          } else {
            not_touching.push(pattern);
          }
        } else {
          not_touching.push(pattern);
        }
      }
    }

    if (word === "height") {
      console.log("not_touching", not_touching);
      console.log("touching", touching);
    }

    ordered_letters = [...not_touching, ...touching];
  } else {
    ordered_letters = JSON.parse(JSON.stringify(letters));
  }

  return ordered_letters
}


export default {
  orderGraphemes: orderGraphemes
}
