import React, { useRef } from "react";
import NativeTitle from "./NativeTitle";
import { createDiaryBackup, parseDiaryBackup } from "../backup/diaryBackup";
import { replaceDiaryState, validateDiaryState } from "../storage/diaryStore";
import { THEMES } from "../constants/themes";

function currentLanguage(data) {
  return data.language === "ja" || (data.language !== "en" && navigator.language?.startsWith("ja")) ? "ja" : "en";
}

export default function Settings({ data, setData, goHome, openAbout, onToggleLock, t, showAlert, showPrompt, triggerOverlay }) {
  const fileRef = useRef(null);
  const exportData = async () => {
    const pin = await showPrompt(
      currentLanguage(data) === "ja"
        ? "バックアップ用の4桁PINを入力してください。空欄の場合は暗号化されません。"
        : "Enter a 4-digit backup PIN. Leave blank for an unencrypted backup.",
      "",
    );
    if (pin === null) return;
    if (pin && !/^\d{4}$/.test(pin)) {
      await showAlert(currentLanguage(data) === "ja" ? "PINは4桁で入力してください。" : "The backup PIN must contain 4 digits.");
      return;
    }
    const backup = await createDiaryBackup(data, pin);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = pin ? "mydiary-backup-encrypted.json" : "mydiary-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imported = await parseDiaryBackup(reader.result, () => showPrompt(
          currentLanguage(data) === "ja" ? "バックアップのPINを入力してください。" : "Enter the backup PIN.",
          "",
        ));
        const validated = validateDiaryState(imported);
        const restored = await replaceDiaryState(validated);
        setData(restored);
      } catch {
        await showAlert(t("import_failed"));
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <main className="screen settings-screen">
      <NativeTitle title={t("settings_btn")} goHome={goHome} />
      <section className="settings-content">
        <h2>{t("theme")}</h2>
        <p>{t("theme_hint")}</p>
        <select value={data.theme} onChange={(event) => {
          const next = event.target.value;
          setData({ ...data, theme: next, userName: THEMES[next].userName });
          if (triggerOverlay) {
            triggerOverlay(next);
          }
        }}>
          <option value="taki">Taki</option>
          <option value="mitsuha">Mitsuha</option>
          <option value="twilight">Twilight</option>
        </select>
        <div className="settings-profile-preview"><span>{t("profile_bg")}</span></div>
        <label>{t("your_name")}<input value={data.userName} onChange={(event) => setData({ ...data, userName: event.target.value })} /></label>
        <div className="color-settings"><span>{t("sec_color")}<i style={{ background: "var(--theme-dark)" }} /></span><span>{t("main_color")}<i style={{ background: "var(--theme)" }} /></span></div>
        <button className="native-button" onClick={goHome}>{t("apply")}</button>
        <hr />
        <h2>{t("language")}</h2><p>{t("language_hint")}</p>
        <select value={data.language || "system"} onChange={(event) => {
          setData({ ...data, language: event.target.value });
        }}>
          <option value="system">{t("system")}</option>
          <option value="en">English (100%)</option>
          <option value="ja">日本語 (100%)</option>
        </select>
        <hr />
        <h2>{t("backup")}</h2>
        <div className="settings-actions"><button onClick={onToggleLock}>{data.locked ? t("remove_lock") : t("set_passcode")}</button><button onClick={exportData}>{t("export")}</button><button onClick={() => fileRef.current?.click()}>{t("import")}</button><button onClick={openAbout}>{t("about")}</button></div>
        <input ref={fileRef} hidden type="file" accept="application/json" onChange={importData} />
      </section>
    </main>
  );
}
