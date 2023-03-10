import { v4 as uuidv4 } from "uuid";

const extractDatasheet = (name, profile) => {
  return {
    name: name,
    M: profile?.characteristics?.characteristic?.find((char) => char.name === "M")["_"] || "",
    WS: profile?.characteristics?.characteristic?.find((char) => char.name === "WS")["_"] || "",
    BS: profile?.characteristics?.characteristic?.find((char) => char.name === "BS")["_"] || "",
    S: profile?.characteristics?.characteristic?.find((char) => char.name === "S")["_"] || "",
    T: profile?.characteristics?.characteristic?.find((char) => char.name === "T")["_"] || "",
    W: profile?.characteristics?.characteristic?.find((char) => char.name === "W")["_"] || "",
    A: profile?.characteristics?.characteristic?.find((char) => char.name === "A")["_"] || "",
    Ld: profile?.characteristics?.characteristic?.find((char) => char.name === "Ld")["_"] || "",
    Sv: profile?.characteristics?.characteristic?.find((char) => char.name === "Save")["_"] || "",
    active: true,
  };
};
const extractWargear = (profile) => {
  return {
    id: uuidv4(),
    name: name,
    profiles: [
      {
        wargear_id: uuidv4(),
        name: profile?.name,
        line: 1,
        Range: profile?.characteristics?.characteristic?.find((char) => char.name === "Range")["_"] || "",
        type: profile?.characteristics?.characteristic?.find((char) => char.name === "Type")["_"] || "",
        S: profile?.characteristics?.characteristic?.find((char) => char.name === "S")["_"] || "",
        AP: profile?.characteristics?.characteristic?.find((char) => char.name === "AP")["_"] || "",
        D: profile?.characteristics?.characteristic?.find((char) => char.name === "D")["_"] || "",
        abilities: profile?.characteristics?.characteristic?.find((char) => char.name === "Abilities")["_"] || "",
      },
    ],
    active: true,
  };
};
const extractMultilineWargear = (profile) => {
  console.log("profile", profile);
  return {
    id: uuidv4(),
    name: name,
    profiles: [
      ...profile.characteristic.characteristic.forEach((subProfile, index) => {
        return {
          wargear_id: uuidv4(),
          name: subProfile?.name,
          line: index,
          Range: subProfile?.characteristics?.characteristic?.find((char) => char.name === "Range")["_"] || "",
          type: subProfile?.characteristics?.characteristic?.find((char) => char.name === "Type")["_"] || "",
          S: subProfile?.characteristics?.characteristic?.find((char) => char.name === "S")["_"] || "",
          AP: subProfile?.characteristics?.characteristic?.find((char) => char.name === "AP")["_"] || "",
          D: subProfile?.characteristics?.characteristic?.find((char) => char.name === "D")["_"] || "",
          abilities: subProfile?.characteristics?.characteristic?.find((char) => char.name === "Abilities")["_"] || "",
        };
      }),
    ],
    active: true,
  };
};

const extractAbility = (profile) => {
  console.log(profile);
  return {
    id: uuidv4(),
    type: "Abilities",
    name: profile.name,
    description: profile?.characteristics?.characteristic?.["_"] || "",
    showDescription: false,
    showAbility: true,
  };
};

const generateDatasheets = (selection) => {
  const datasheets = [];
  if (Array.isArray(selection.profiles.profile)) {
    selection.profiles.profile.forEach((profile) => {
      if (profile.typeName === "Unit") {
        datasheets.push(extractDatasheet(profile.name, profile));
      }
    });
  } else {
    datasheets.push(extractDatasheet(selection.name, selection.profiles?.profile));
  }
  return datasheets;
};

const generateAbilities = (selection) => {
  const abilities = [];
  if (Array.isArray(selection?.profiles?.profile)) {
    selection?.profiles?.profile?.forEach((profile) => {
      if (profile.typeName === "Abilities") {
        abilities.push(extractAbility(profile));
      }
    });
  } else {
    if (selection.profiles?.profile) {
      abilities.push(extractAbility(selection.profiles?.profile));
    }
  }
  return abilities;
};

const generateUpgrades = (selection) => {
  const abilities = [];
  if (Array.isArray(selection?.profiles?.profile)) {
    selection?.profiles?.profile?.forEach((profile) => {
      if (profile.typeName === "Abilities") {
        abilities.push(extractAbility(profile));
      }
    });
  } else {
    if (selection?.profiles?.profile) {
      wargear.push(extractAbility(selection?.profiles?.profile));
    }
  }
  return abilities;
};

const generateModelWargear = (model) => {
  const wargear = [];
  console.log("selection:", model );
  if (Array.isArray(model.selections.selection)) {
    model.selections.selection.forEach((selection) => {
      if (selection.type === "upgrade" && selection?.profiles?.profile) {
        console.log("start", selection);
        if (Array.isArray(selection?.profiles?.profile)) {
          selection.profiles.profile.forEach((profile) => {
            if (profile.typeName.toLowerCase() === "weapon") {
              wargear.push(extractWargear(profile));
            }
          });
        } else {
          if (selection?.profiles?.profile.typeName.toLowerCase() === "weapon") {
            wargear.push(extractWargear(selection.profiles.profile));
          }
        }
      }
    });
  } else {
    // if (selection?.profiles?.profile && selection?.profiles?.profile.typeName.toLowerCase() === "weapon") {
    //   wargear.push(extractWargear(selection?.profiles?.profile));
    // }
  }
  return wargear;
};

export { extractDatasheet, generateDatasheets, generateAbilities, generateModelWargear };