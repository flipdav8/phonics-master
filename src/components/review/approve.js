let supabase = null;

const setup = function setup(supa) {
  supabase = supa;
}

const approve = async function approve(word, ref_view) {
  if (word["approve_loading"]) {
    return;
  }
  word["approve_loading"] = true;
  let session = await supabase.auth.getSession();
  let email = session?.data?.session.user.email;

  let combine_id = word.id;
  let word_id = word.word_id;
  let by = [email];

  let insert_data = {
    word_id: word_id,
    combine_id: combine_id,
    by: by,
  };

  let view = ref_view;

  if (view[0] === undefined) {
    return;
  }

  let given_pids = view[0].pids;
  let current_pids = view[0].use_pids;

  if (given_pids.toString() !== current_pids.toString()) {
    insert_data["pids_changed"] = true;
    trackMods({
      data: insert_data,
      type: "phoneme",
      from_pids: given_pids,
      to_pids: current_pids,
    });
  }

  let current_letters = view[0].ordered_letters[view[0].variation_index];
  let letters_changed = view[0].letters_changed;
  if (letters_changed) {
    insert_data["lids_changed"] = true;
  } else if (view[0].letters.length > 1) {
    // note down letters.. or
  }

  // console.log("current_letters", current_letters);

  if (view[0].valid_letters === false) {
    alert("non valid letters");
    return;
  }

  insert_data["pids"] = current_pids;
  insert_data["lids"] = current_letters;

  console.log("insert_data", insert_data);

  let error = await approveRecord(word, insert_data);
  if (error !== null) {
    return;
  }

  await approveTable(insert_data);
  word["approve_loading"] = false;
  word["approved"] = true;
}


const approveRecord = async function approveRecord(word, insert_data) {
  let update = {
    id: word.id,
    approve_au: true,
    lids: [insert_data["lids"]],
  };
  if (insert_data["pids_changed"]) {
    update["pids"] = insert_data["pids"];
    update["pids_reject"] = word.pids;
  }
  const { data, error } = await supabase.from("combine").upsert(update);

  return error;
}

const approveTable = async function approveTable(insert_data) {
  let check = await checkExistsCOMBINE(insert_data);
  if (check !== null && check.length > 0) {
    let update_data = insert_data;
    update_data["id"] = check[0].id;
    update_data["by"] = [...insert_data.by, ...check[0].by];
    const { data, error } = await supabase
      .from("approved_1")
      .upsert(update_data);
    console.log("update error", error);
    console.log("update data", data);
  } else {
    const { data, error } = await supabase
      .from("approved_1")
      .insert(insert_data);

    console.log("error", error);
    console.log("data", data);
  }
}

const checkExistsCOMBINE = async function checkExistsCOMBINE(insert_data) {
  const { data, error } = await supabase
    .from("approved_1")
    .select()
    .eq("word_id", insert_data.word_id)
    .eq("combine_id", insert_data.combine_id);

  return data;
}

const trackMods = async function trackMods(payload) {
  // setup table to insert..
  // console.log("track mods", payload);
  if (payload.type === "phoneme") {
    function compareArrays(fromArray, toArray) {
      const outputArray = [];
      for (let i = 0; i < fromArray.length; i++) {
        if (fromArray[i] !== toArray[i]) {
          outputArray.push({
            from: fromArray[i],
            to: toArray[i],
            // index: i,
          });
        }
      }

      return outputArray;
    }

    // Example usage:
    const fromArray = payload.from_pids;
    const toArray = payload.to_pids;

    if (fromArray.length !== toArray.length) {
      return;
    }

    const compare_results = compareArrays(fromArray, toArray);
    // console.log(compare_results); // Output: [{ from: '1', to: '2', index: 0 }]

    for (let index = 0; index < compare_results.length; index++) {
      const result = compare_results[index];
      let check = await checkModExists(result);
      if (check.length > 0) {
        let update_data = check[0];
        update_data["count"] = parseInt(update_data["count"]) + 1;
        const { data, error } = await supabase
          .from("mods")
          .upsert(update_data);
        console.log("update error", error);
        console.log("update data", data);
      } else {
        const { data, error } = await supabase
          .from("mods")
          .insert({ ...result, count: 1 });
        console.log("error", error);
        console.log("data", data);
      }
    }
  } else {
  }
}

const checkModExists = async function checkModExists(compare_result) {
  const { data, error } = await supabase
    .from("mods")
    .select()
    .eq("from", compare_result.from)
    .eq("to", compare_result.to);

  return data;
}



export default {
  setup: setup,
  approve: approve,

}
