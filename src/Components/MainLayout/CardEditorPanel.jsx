import React from "react";
import { NecromundaCardEditor } from "../Necromunda/CardEditor";
import { Warhammer40K10eCardEditor } from "../Warhammer40k-10e/CardEditor";
import { Warhammer40KCardEditor } from "../Warhammer40k/CardEditor";

export const CardEditorPanel = ({ activeCard }) => {
  if (!activeCard) {
    return null;
  }

  return (
    <div style={{ overflowY: "auto", height: "calc(100vh - 64px)" }} className={`data-${activeCard?.source}`}>
      {activeCard?.source === "40k" && <Warhammer40KCardEditor />}
      {activeCard?.source === "40k-10e" && <Warhammer40K10eCardEditor />}
      {activeCard?.source === "basic" && <Warhammer40KCardEditor />}
      {activeCard?.source === "necromunda" && <NecromundaCardEditor />}
    </div>
  );
};
