import React, { useState } from "react";
import Icon from "./Icon";

export default function QuickSettings({ data, setData, close, open, onAddTopic, onToggleLock, t }) {
  const [isClosing, setIsClosing] = useState(false);

  const performClose = (actionCallback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      actionCallback();
    }, 280);
  };

  return (
    <div className={`sheet-scrim ${isClosing ? "closing" : ""}`} onMouseDown={() => performClose(close)}>
      <div className={`quick-sheet ${isClosing ? "closing" : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <button onClick={() => performClose(onAddTopic)}><Icon name="ic_add_white_36dp.png" /><span>{t("add_topic_btn")}</span></button>
        <button onClick={() => performClose(() => open("settings"))}><Icon name="ic_settings_white_36dp.png" /><span>{t("settings_btn")}</span></button>
        <button onClick={() => performClose(onToggleLock)}><Icon name={data.locked ? "ic_no_encryption_white_36dp.png" : "ic_enhanced_encryption_white_36dp.png"} /><span>{t("passcode_btn")}</span></button>
        <button onClick={() => performClose(() => open("settings"))}><Icon name="ic_backup_white_36dp.png" /><span>{t("backup_btn")}</span></button>
        <button onClick={() => performClose(() => open("about"))}><Icon name="ic_perm_device_information_white_36dp.png" /><span>{t("about_btn")}</span></button>
      </div>
    </div>
  );
}
