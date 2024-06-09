import PH from "/src/components/icons/phonemes.js";
const PHONEMES = PH.list;

import respelling from "./respelling.json"

// let syllabic = ['l̩', 'n̩', 'm̩'];
let syllabic_c = [60, 61, 62];
let syllabic = PHONEMES.filter(
  (e) =>
    (e.classes !== undefined && e.classes.includes("vowel")) ||
    syllabic_c.includes(e.list_id) || e.type === 'ab'
);

const doRespell = function doRespell(given_pids, stress) {
  /// extra rules..

  let add_r_to = ["a", "e", "i", "u", "o"];

  let respell_array = [];
  let deblend_array = [];
  let pids = given_pids.map(e => !isNaN(e) ? parseInt(e) : e);

  let deblend_things = false;
  for (let idx = 0; idx < stress.length; idx++) {
    let stress_array = stress[idx];
    let syllables = [];
    let current_syllable = "";
    let current_stress_index = 0;
    let skip = false;
    let syllable_index = -1;
    let add_respell = "";
    let deblend = [];
    for (let xx = 0; xx < pids.length; xx++) {
      if (skip) {
        skip = false;
        continue;
      }

      syllable_index++;
      let stressed = stress_array[current_stress_index];
      const pid = isNaN(pids[xx]) ? pids[xx] : parseInt(pids[xx]);
      let rspl = "";
      let respell = respelling.find((e) => e.list_id === pid);
      let phoneme = PHONEMES.find((e) => e.list_id === pid);
      if (respell !== undefined) {
        rspl = add_respell + respell.respell;
      } else {
        if (phoneme.type === 'ab') {
          rspl = phoneme.label.toLowerCase();

          // syllables.push(current_syllable);
          // current_syllable = "";
          // current_stress_index++;
          // syllable_index = -1;
          // continue;
        }
      }

      add_respell = "";

      let is_vowel_like = false;
      if (phoneme.classes !== undefined && phoneme.classes.includes("vowel"))
        is_vowel_like = true;

      let next_pid = pids[xx + 1];
      if (next_pid !== undefined) {
        let next_phoneme = PHONEMES.find((e) => e.list_id === next_pid);
        let next_respell = respelling.find((e) => e.list_id === next_pid);

        if (next_phoneme.label === "r") {
          if (add_r_to.includes(rspl)) {
            rspl = rspl + "r";
          }
        }

        let doule_blend_consonants = [
          ["gz", "g", "z"],
          ["gz", "g", "z"],
          ["gzh", "g", "zh"],
          ["tsz", "ts", "z"],
          ["ksh", "k", "sh"],
          // ["ks", "k", "s"],
          ["gd", "g", "d"],
        ];

        let syllabic_c = [60, 61, 62];

        if (next_respell == undefined) {
          // console.log('no respell for', next_pid); proably an abbreviation
          if (next_phoneme.type !== "ab") {
            console.log("no respell for", next_pid);
          }
        } else if (is_vowel_like && phoneme.classes.includes("short vowel")) {
          if (
            deblend_things &&
            !syllabic_c.includes(pid) &&
            doule_blend_consonants
              .map((e) => e[0])
              .includes(next_respell.respell)
          ) {
            let dbl_blend = doule_blend_consonants.find(
              (e) => e[0] === next_respell.respell
            );
            rspl = rspl + dbl_blend[1];
            add_respell = dbl_blend[2];
            deblend.push({ pid: next_pid, array: dbl_blend });
            skip = true;
          } else if (
            next_phoneme.classes !== undefined &&
            next_phoneme.classes.includes("consonant")
          ) {
            rspl = rspl + next_respell.respell;
            skip = true;
          }

        } else if (is_vowel_like) {
          let next_next_pid = pids[xx + 2];

          if (
            deblend_things &&
            is_vowel_like &&
            !syllabic_c.includes(pid) &&
            doule_blend_consonants
              .map((e) => e[0])
              .includes(next_respell.respell)
          ) {
            let dbl_blend = doule_blend_consonants.find(
              (e) => e[0] === next_respell.respell
            );
            rspl = rspl + dbl_blend[1];
            add_respell = dbl_blend[2];
            deblend.push({ pid: next_pid, array: dbl_blend });
            skip = true;
          } else if (next_next_pid !== undefined) {
            let next_next_phoneme = PHONEMES.find(
              (e) => e.list_id === next_next_pid
            );
            // let next_next_respell = respelling.find(e => e.list_id === next_next_pid);
            //double consonant upcoming
            if (
              next_phoneme.classes !== undefined &&
              next_phoneme.classes.includes("consonant")
            ) {
              if (
                next_next_phoneme.classes !== undefined &&
                next_next_phoneme.classes.includes("consonant")
              ) {
                rspl = rspl + next_respell.respell;
                skip = true;
              }
            }
          }
        }
      }

      if (syllable_index > 0) {
        if (rspl === "eye") rspl = "y";
      }

      if (stressed > 0) rspl = rspl.toUpperCase();

      current_syllable = current_syllable + rspl;

      if (phoneme !== undefined) {
        if (is_vowel_like || phoneme.type === 'ab') {
          syllables.push(current_syllable);
          current_syllable = "";
          current_stress_index++;
          syllable_index = -1;
        }
      }

      if (xx === pids.length - 1 && !is_vowel_like) {
        let last_syllable = syllables[syllables.length - 1];

        if (last_syllable == undefined) {
          syllables.push(current_syllable);
        } else {
          if (last_syllable[0].toUpperCase() === last_syllable[0]) {
            current_syllable = current_syllable.toUpperCase();
          }
          syllables[syllables.length - 1] = last_syllable + current_syllable;
          //join previous syllable;
        }
      }
    }
    deblend_array.push(deblend);
    respell_array.push(syllables.join("-"));
  }

  return respell_array[0];

  // return [respell_array, deblend_array];
  //when follwed by an r .. (+ follwed again ... ) PAA-kuh vs PAR-kuh
  // a => becomes ar   marry
  // e => becomes er   merry
  //i => becomes i in mirror
  //u becomes ur in hurry

  //eye becomes y if not at start of word? or right after another eye?

  // ng before g   n-g  singer vs finger  ng-g
  //ng befor k become nk?

  //wen vowel is long (or dipthong?)  following consonant will be places after the hypen.. PEE-tuh (peter)  unless consonant is sibilant?
  //When a vowel is short, the consonant goes immediately after the vowel, before the hyphen: JEN-ee (Jenny).
};

const makeStressPattern = function makeStressPattern(given_pids, stress) {
  let pattern = [];
  let pids = given_pids.map(e => !isNaN(e) ? parseInt(e) : e);

  let stress_index = 0;
  for (let idx = 0; idx < pids.length; idx++) {
    const pid = pids[idx];
    let syllabic_phoneme = syllabic.find((e) => e.list_id === pid);
    if (syllabic_phoneme !== undefined) {
      let stressed = stress[stress_index];
      if (stressed !== undefined) {
        pattern.push(stressed);
        stress_index++
      } else {
        pattern.push(0);
      }
    } else {
      pattern.push(-1)
    }
  }

  return pattern;
}


export default {
  doRespell: doRespell,
  makeStressPattern: makeStressPattern,
}
