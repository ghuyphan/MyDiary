import React, { useCallback, useEffect, useRef, useState } from "react";
import { loadDiaryDraft, saveDiaryDraft, deleteDiaryDraft } from "../storage/diaryStore";
import { processDiaryImage } from "../storage/imageProcessing";
import Icon from "./Icon";
import BottomBar from "./BottomBar";
import IOSDatePickerSheet from "./IOSDatePickerSheet";
import IOSTimePickerSheet from "./IOSTimePickerSheet";

const TextareaBlock = ({ value, onChange, onFocus, onBlur, placeholder }) => {
  const ref = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    adjustHeight();
    const t1 = setTimeout(adjustHeight, 50);
    const t2 = setTimeout(adjustHeight, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onFocus={(e) => {
        if (onFocus) onFocus(e);
        adjustHeight();
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        border: "none",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        backgroundColor: "transparent",
        minHeight: "28px"
      }}
    />
  );
};

export default function DiaryEditor({ entry, data, setData, close, t, currentLang, showConfirm, showPrompt, showAlert, triggerOverlay, onSaved }) {
  const createDraft = () => {
    const d = new Date();
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      id: Date.now(),
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      weekday: weekdays[d.getDay()],
      time: d.toTimeString().slice(0, 5),
      title: "",
      content: "",
      mood: "happy",
      weather: "sunny",
      location: "No Location",
      photos: [],
      items: [{ id: "text_0", type: "text", value: "" }]
    };
  };

  const [draft, setDraft] = useState(entry || createDraft());
  const [items, setItems] = useState([]);
  const [activeTextarea, setActiveTextarea] = useState({ id: null, selectionStart: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const draftKey = entry ? `entry:${entry.id}` : "entry:new";
  const draftRef = useRef(draft);
  const itemsRef = useRef(items);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const baseDraft = entry ? { ...entry, photos: entry.photos || [] } : createDraft();
    const baseItems = entry?.items || [{ id: "text_0", type: "text", value: entry?.content || "" }];
    setDraft(baseDraft);
    setItems(baseItems);
    setActiveTextarea({ id: baseItems[0]?.id || "text_0", selectionStart: 0 });
    setDraftReady(false);

    loadDiaryDraft(draftKey)
      .then(async (savedDraft) => {
        if (cancelled || !savedDraft) return;
        const recover = await showConfirm(
          currentLang === "ja"
            ? "保存されていない下書きがあります。復元しますか？"
            : "An unsaved draft was found. Restore it?",
        );
        if (!cancelled && recover) {
          setDraft(savedDraft.draft);
          setItems(savedDraft.items);
          setActiveTextarea({ id: savedDraft.items[0]?.id || "text_0", selectionStart: 0 });
        } else if (!recover) {
          await deleteDiaryDraft(draftKey);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDraftReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [currentLang, draftKey, entry, showConfirm]);

  const hasUnsavedChanges = useCallback((currentDraft, currentItems) => {
    if (!entry) {
      const emptyDraft = (currentDraft.title || "").trim() === "" &&
                         currentDraft.mood === "happy" &&
                         currentDraft.weather === "sunny" &&
                         currentDraft.location === "No Location" &&
                         (currentDraft.photos || []).length === 0;
      const emptyItems = currentItems.length === 1 &&
                         currentItems[0].type === "text" &&
                         (currentItems[0].value || "").trim() === "";
      return !(emptyDraft && emptyItems);
    }

    if (currentDraft.title !== (entry.title || "")) return true;
    if (currentDraft.mood !== (entry.mood || "happy")) return true;
    if (currentDraft.weather !== (entry.weather || "sunny")) return true;
    if (currentDraft.location !== (entry.location || "No Location")) return true;
    if (currentDraft.date !== entry.date) return true;
    if (currentDraft.time !== entry.time) return true;

    const entryItems = entry.items || [{ id: "text_0", type: "text", value: entry.content || "" }];
    if (currentItems.length !== entryItems.length) return true;
    for (let i = 0; i < currentItems.length; i++) {
      if (currentItems[i].type !== entryItems[i].type) return true;
      if (currentItems[i].value !== entryItems[i].value) return true;
    }

    return false;
  }, [entry]);

  useEffect(() => {
    if (!draftReady) return undefined;
    const shouldSave = hasUnsavedChanges(draft, items);
    const handler = window.setTimeout(() => {
      const action = shouldSave
        ? saveDiaryDraft(draftKey, { draft, items })
        : deleteDiaryDraft(draftKey);
      action.catch((error) => console.error("Failed to save diary draft", error));
    }, 700);
    return () => window.clearTimeout(handler);
  }, [draft, draftKey, draftReady, items, hasUnsavedChanges]);

  useEffect(() => {
    if (!draftReady) return undefined;
    const persistOnHide = () => {
      if (document.visibilityState !== "hidden") return;
      const currentDraft = draftRef.current;
      const currentItems = itemsRef.current;
      const shouldSave = hasUnsavedChanges(currentDraft, currentItems);
      if (shouldSave) {
        saveDiaryDraft(draftKey, { draft: currentDraft, items: currentItems }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", persistOnHide);
    return () => document.removeEventListener("visibilitychange", persistOnHide);
  }, [draftKey, draftReady, hasUnsavedChanges]);

  const update = (key, value) => {
    if (key === "date") {
      const d = new Date(`${value}T00:00:00`);
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      setDraft({
        ...draft,
        date: value,
        day: d.getDate(),
        weekday: weekdays[d.getDay()]
      });
    } else {
      setDraft({ ...draft, [key]: value });
    }
  };

  const save = async () => {
    const textValues = items.filter(item => item.type === "text").map(item => item.value);
    const hasContent = textValues.some(v => v.trim()) || items.some(item => item.type === "photo");
    if (!(draft.title || "").trim() && !hasContent) {
      await showAlert(t("save_failed_empty"));
      return;
    }

    const photoValues = items.filter(item => item.type === "photo").map(item => item.value);
    const contentText = textValues.join("\n");
    const summaryText = textValues[0] || "";

    const updatedEntry = {
      ...draft,
      title: (draft.title || "").trim() || t("no_title"),
      content: contentText,
      summary: summaryText,
      items: items,
      photos: photoValues
    };

    const exists = data.entries.some((item) => item.id === draft.id);
    setData({
      ...data,
      entries: exists
        ? data.entries.map((item) => item.id === draft.id ? updatedEntry : item)
        : [updatedEntry, ...data.entries]
    });
    await deleteDiaryDraft(draftKey);

    if (triggerOverlay) {
      triggerOverlay();
    }
    if (onSaved) {
      onSaved();
    }
    close();
  };

  const remove = async () => {
    if (await showConfirm(t("delete_entry_confirm"))) {
      setData({ ...data, entries: data.entries.filter((item) => item.id !== draft.id) });
      await deleteDiaryDraft(draftKey);
      close();
    }
  };

  const handleClear = async () => {
    if (await showConfirm(t("discard_draft_confirm"))) {
      await deleteDiaryDraft(draftKey);
      setDraft(createDraft());
      setItems([{ id: "text_0", type: "text", value: "" }]);
      close();
    }
  };

  const handleLocationClick = () => {
    const isLocationSet = draft.location && draft.location !== "No Location" && draft.location !== "";
    if (isLocationSet) {
      update("location", "No Location");
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let detectedCity = "";
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`);
              const geodata = await response.json();
              detectedCity = geodata.address?.city || geodata.address?.town || geodata.address?.village || geodata.address?.state || "";
            } catch (err) {
              console.error("Geocoding failed", err);
            }
            const userLoc = await showPrompt(t("confirm_location", detectedCity || "Itomori"), detectedCity || "Itomori");
            if (userLoc !== null) {
              update("location", userLoc.trim() || "No Location");
            }
          },
          async (error) => {
            console.error(error);
            const userLoc = await showPrompt(t("gps_failed"));
            if (userLoc) {
              update("location", userLoc.trim());
            }
          }
        );
      } else {
        (async () => {
          const userLoc = await showPrompt(t("geolocation_unsupported"));
          if (userLoc) {
            update("location", userLoc.trim());
          }
        })();
      }
    }
  };

  const fileInputRef = useRef(null);
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await processDiaryImage(file);
      setItems(prev => {
        const idx = prev.findIndex(item => item.id === activeTextarea.id);
        if (idx !== -1 && prev[idx].type === "text") {
          const textItem = prev[idx];
          const textVal = textItem.value;
          const splitIdx = activeTextarea.selectionStart;
          const firstPart = textVal.slice(0, splitIdx);
          const secondPart = textVal.slice(splitIdx);
          
          const newText1 = { ...textItem, value: firstPart };
          const newPhoto = { id: `photo_${Date.now()}`, type: "photo", value: imageData };
          const newText2 = { id: `text_${Date.now()}`, type: "text", value: secondPart };
          
          const next = [...prev];
          next.splice(idx, 1, newText1, newPhoto, newText2);
          return next;
        } else {
          return [
            ...prev,
            { id: `photo_${Date.now()}`, type: "photo", value: imageData },
            { id: `text_${Date.now()}`, type: "text", value: "" }
          ];
        }
      });
    } catch (error) {
      await showAlert(error.message || "Unable to add this image.");
    } finally {
      e.target.value = "";
    }
  };

  const handleTextChange = (id, val) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, value: val } : item));
  };

  const handleTextFocus = (id, selectionStart) => {
    setActiveTextarea({ id, selectionStart });
  };

  const handleTextBlur = (id, selectionStart) => {
    setActiveTextarea({ id, selectionStart });
  };

  const handleDeletePhoto = (id) => {
    setItems(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1) return prev;
      
      const next = prev.filter(item => item.id !== id);
      
      if (idx > 0 && idx < prev.length - 1) {
        const prevItem = next[idx - 1];
        const nextItem = next[idx];
        if (prevItem && nextItem && prevItem.type === "text" && nextItem.type === "text") {
          prevItem.value = prevItem.value + (nextItem.value ? "\n" + nextItem.value : "");
          return next.filter((_, pidx) => pidx !== idx);
        }
      }
      return next;
    });
  };

  const [showEasterMenu, setShowEasterMenu] = useState(false);
  const easterPhrases = [
    { text: "お前は誰だ？", desc: "Who are you? (Mitsuha/Taki)" },
    { text: "あいつ、また勝手に私の体を...", desc: "Him, again using my body... (Mitsuha)" },
    { text: "奥寺先輩と馴れ馴れしくするな！", desc: "Don't get close to Okudera-senpai! (Mitsuha)" },
    { text: "司とベタベタするな！", desc: "Don't cuddle with Tsukasa! (Taki)" },
    { text: "これって、夢じゃない...？", desc: "Is this not a dream...? (Taki)" },
    { text: "大事な人。忘れたくない人。忘れてはいけない人。", desc: "Someone precious..." }
  ];

  const dateText = currentLang === "ja"
    ? new Date(`${draft.date}T00:00:00`).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) + " (" + new Date(`${draft.date}T00:00:00`).toLocaleDateString("ja-JP", { weekday: "short" }) + ")"
    : new Date(`${draft.date}T00:00:00`).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  
  const timeText = new Date(`2000-01-01T${draft.time}`).toLocaleTimeString(currentLang === "ja" ? "ja-JP" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: currentLang !== "ja"
  });

  const isLocationSet = draft.location && draft.location !== "No Location" && draft.location !== "";
  const locationIcon = isLocationSet ? "ic_location_on_white_24dp.png" : "ic_location_off_white_24dp.png";

  return (
    <section className="diary-editor">
      <div className="editor-date">
        <button className="editor-date-control" onClick={() => setShowDatePicker(true)} type="button">
          <span>{dateText}</span>
        </button>
        <EditorCalendarIcon />
        <b>{draft.day}</b>
        <button className="editor-time-control" onClick={() => setShowTimePicker(true)} type="button">
          <span>{timeText}</span>
          <small>{draft.location === "No Location" ? t("no_location") : draft.location}</small>
        </button>
        <EditorClockIcon />
      </div>
      <div className="editor-sheet">
        <div className="editor-title-row">
          <input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder={t("diary_title_hint")} />
          <label><Icon name={`ic_weather_${draft.weather}.png`} tint /><select value={draft.weather} onChange={(event) => update("weather", event.target.value)}>{["sunny", "cloud", "windy", "rainy", "snowy", "foggy"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><Icon name={`ic_mood_${draft.mood}.png`} tint /><select value={draft.mood} onChange={(event) => update("mood", event.target.value)}>{["happy", "soso", "unhappy"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        
        <div className="editor-content-blocks" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0' }}>
          {items.map((item, index) => {
            if (item.type === "text") {
              return (
                <TextareaBlock
                  key={item.id}
                  value={item.value}
                  onChange={(e) => handleTextChange(item.id, e.target.value)}
                  onFocus={(e) => handleTextFocus(item.id, e.target.selectionStart)}
                  onBlur={(e) => handleTextBlur(item.id, e.target.selectionStart)}
                  placeholder={index === 0 ? t("diary_content_hint") : ""}
                />
              );
            } else if (item.type === "photo") {
              return (
                <div key={item.id} className="editor-photo-wrapper">
                  <img src={item.value} alt="Attached inline" />
                  <button className="delete-photo-btn" onClick={() => handleDeletePhoto(item.id)}>
                    <Icon name="ic_delete_white_24dp.png" style={{ width: '20px', height: '20px', filter: 'none' }} />
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      {showEasterMenu && (
        <>
          <div className="easter-scrim" onClick={() => setShowEasterMenu(false)} />
          <div className="easter-popup">
            <h4>{t("insert_movie_phrase")}</h4>
            <ul>
              {easterPhrases.map((phrase, idx) => (
                <li key={idx} onClick={() => {
                  setItems(prev => {
                    const activeIdx = prev.findIndex(item => item.id === activeTextarea.id);
                    if (activeIdx !== -1 && prev[activeIdx].type === "text") {
                      return prev.map(item => item.id === activeTextarea.id ? { ...item, value: item.value + (item.value ? "\n" : "") + phrase.text } : item);
                    }
                    const lastTextIdx = prev.map(item => item.type).lastIndexOf("text");
                    if (lastTextIdx !== -1) {
                      const next = [...prev];
                      next[lastTextIdx] = { ...next[lastTextIdx], value: next[lastTextIdx].value + (next[lastTextIdx].value ? "\n" : "") + phrase.text };
                      return next;
                    }
                    return prev;
                  });
                  setShowEasterMenu(false);
                }}>
                  <span className="easter-phrase-jp">{phrase.text}</span>
                  <span className="easter-phrase-en">{phrase.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <BottomBar>
        <button onClick={() => setShowEasterMenu(!showEasterMenu)} title={t("movie_phrases")}><Icon name="ic_more_horiz_white_24dp.png" /></button>
        <button onClick={handleLocationClick} title={t("location")}><Icon name={locationIcon} /></button>
        <button onClick={handlePhotoClick} title={t("attach_photo")}><Icon name="ic_photo_camera_white_24dp.png" /></button>
        {entry && <button onClick={remove} title={t("delete_entry")}><Icon name="ic_delete_white_24dp.png" /></button>}
        <button onClick={handleClear} title={t("discard_draft")}><Icon name="ic_clear_white_24dp.png" /></button>
        <button onClick={save} title={t("save_entry")}><Icon name="ic_save_white_24dp.png" /></button>
      </BottomBar>

      {showDatePicker && (
        <IOSDatePickerSheet
          value={draft.date}
          onClose={() => setShowDatePicker(false)}
          onSave={(newDate) => {
            update("date", newDate);
            setShowDatePicker(false);
          }}
          t={t}
          currentLang={currentLang}
        />
      )}

      {showTimePicker && (
        <IOSTimePickerSheet
          value={draft.time}
          onClose={() => setShowTimePicker(false)}
          onSave={(newTime) => {
            update("time", newTime);
            setShowTimePicker(false);
          }}
          t={t}
          currentLang={currentLang}
        />
      )}
    </section>
  );
}

function EditorCalendarIcon() {
  return (
    <svg className="editor-info-icon" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8h14M7 3v3M13 3v3" />
      <circle cx="7" cy="11" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="11" r=".7" fill="currentColor" stroke="none" />
      <circle cx="13" cy="11" r=".7" fill="currentColor" stroke="none" />
      <circle cx="7" cy="14" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="14" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EditorClockIcon() {
  return (
    <svg className="editor-info-icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 5.8V10l3 1.7" />
    </svg>
  );
}
