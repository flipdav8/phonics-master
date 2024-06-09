
const tricky_blends = [
  { list_id: '60d', list_ids: [44, 42], ghost_graphemes: ['o'], label: 'Wʌ', join: [] },
  { list_id: 60, list_ids: [37, 20], ghost_graphemes: [], label: 'əl', join: [] },
  { list_id: 19, list_ids: [18, 36], ghost_graphemes: [], label: 'ks', join: [] }, //locks example.. we want to collapse in this case..
  { list_id: 47, list_ids: [45, 28], ghost_graphemes: ['u'], label: 'yu', join: [] },
  { list_id: 46, list_ids: [45, 30], ghost_graphemes: ['u', 'ue', 'ua'], label: 'yoo(l)', join: [] },
  { list_id: 34, list_ids: [18, 44], ghost_graphemes: [], label: 'qu(kw)', join: ['qu'] },

]

const finalTouches = function finalTouches(pids, lids) {

  let final_pids = [];
  let final_lids = [];
  let changes = [];
  let mod = false;
  let joined = false;

  for (let index = 0; index < pids.length; index++) {
    if (joined) {
      joined = false;
      continue;
    }
    const pid = pids[index].toString();
    const lid = lids[index];
    let tricky = tricky_blends.find(e => e.list_id.toString() === pid)
    if (tricky != undefined) {
      let ghost_lid = tricky.ghost_graphemes.includes(lid);

      if (ghost_lid) {
        final_pids.push(...tricky.list_ids)
        final_lids.push('^', lid);
        mod = true;
        changes.push(index, index + 1);
      } else {

        final_pids.push(pid);
        final_lids.push(lid);

      }

    } else {

      let join_g = lid + lids[index + 1];
      // console.log('here', join_g)
      let make_join = tricky_blends.find(e => e.join.includes(join_g))
      if (make_join !== undefined) {
        final_pids.push(make_join.list_id);
        final_lids.push(join_g);
        mod = true;
        joined = true;
        changes.push(index);
      } else {

        final_pids.push(pid);
        final_lids.push(lid);
      }


    }
  }

  return {
    pids: final_pids,
    lids: final_lids,
    changes: changes,
    mod: mod,
  }
}


export default {
  tricky: tricky_blends,
  finalTouches: finalTouches,
}
