import React, { useState } from "react";
import NativeDialog from "./NativeDialog";

export default function AddTopicDialog({ close, save, t }) {
  const [title, setTitle] = useState("");
  const [choosingType, setChoosingType] = useState(false);
  
  const continueToType = () => {
    if (!title.trim()) return;
    setChoosingType(true);
  };

  if (choosingType) {
    return (
      <div className="ios-action-sheet-scrim" onMouseDown={close}>
        <div className="ios-action-sheet" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("add_topic")}>
          <div className="ios-action-sheet-group">
            <div className="ios-action-sheet-title">{t("add_topic")}</div>
            <button onClick={() => save(title.trim(), "diary")}>{t("diary")}</button>
            <button onClick={() => save(title.trim(), "memo")}>{t("memo")}</button>
            <button onClick={() => save(title.trim(), "contacts")}>{t("contacts")}</button>
          </div>
          <button className="ios-action-sheet-cancel" onClick={() => setChoosingType(false)}>{t("cancel")}</button>
        </div>
      </div>
    );
  }

  return (
    <NativeDialog title={t("add_topic")} close={close}>
      <div className="ios-form-fields">
        <input
          placeholder={t("topic_name")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </div>
      <div className="ios-form-actions">
        <button className="ios-form-cancel" onClick={close}>{t("cancel")}</button>
        <button className="ios-form-ok" onClick={continueToType}>{t("ok")}</button>
      </div>
    </NativeDialog>
  );
}
