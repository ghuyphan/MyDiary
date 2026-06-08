import React, { useCallback, useEffect, useRef, useState } from "react";

const A = import.meta.env.BASE_URL + "assets/icons/";
const THEMES = {
  taki: {
    name: "Taki",
    main: "#67b5e6",
    dark: "#70a3b4",
    userName: "立花 瀧",
    background: `${A}theme_bg_taki.png`,
    profile: `${A}profile_theme_bg_taki.png`,
    contacts: `${A}contacts_bg_taki.png`,
  },
  mitsuha: {
    name: "Mitsuha",
    main: "#ef7265",
    dark: "#b3371f",
    userName: "宮水 三葉",
    background: `${A}theme_bg_mitsuha.png`,
    profile: `${A}profile_theme_bg_mitsuha.png`,
    contacts: `${A}contacts_bg_mitsuha.png`,
  },
};

const TRANSLATIONS = {
  en: {
    entries: "Entries",
    calendar: "Calendar",
    diary: "Diary",
    no_title: "No Title",
    diary_title_hint: "Diary title",
    diary_content_hint: "Write your diary here",
    no_location: "No Location",
    about: "About",
    theme: "Theme",
    theme_hint: "Pick your theme",
    your_name: "Your name",
    sec_color: "Sec. color",
    main_color: "Main color",
    profile_bg: "Profile Background",
    apply: "Apply",
    language: "Language",
    language_hint: "Pick your language",
    system: "System",
    remove_lock: "Remove lock",
    set_passcode: "Set passcode",
    export: "Export",
    import: "Import",
    add_topic: "Add Topic",
    topic_name: "Topic Name",
    cancel: "Cancel",
    ok: "OK",
    entries_count: (count) => count === 1 ? "1 Entry" : `${count} Entries`,
    photo_overview: "Photo Overview",
    no_photos: "No photos attached yet.",
    view_diary_entry: "View Diary Entry",
    add_contact: "Add contact",
    name: "Name",
    phone: "Phone",
    delete_contact_confirm: "Delete this contact?",
    delete_topic_confirm: (title) => `Are you sure you want to delete the topic "${title}"? This will delete all its data.`,
    rename_topic_prompt: (title) => `Enter new name for "${title}":`,
    discard_draft_confirm: "Are you sure you want to discard your draft?",
    delete_entry_confirm: "Are you sure you want to delete this diary entry?",
    add: "Add",
    enter_passcode: "ENTER PASSCODE",
    create_passcode: "CREATE PASSCODE",
    confirm_passcode: "CONFIRM PASSCODE",
    enter_passcode_to_unlock: "ENTER PASSCODE TO UNLOCK",
    wrong_passcode: "WRONG PASSCODE. TRY AGAIN.",
    passcode_not_match: "PASSCODES DID NOT MATCH.",
    backup: "Backup",
    add_topic_btn: "Add topic",
    settings_btn: "Settings",
    passcode_btn: "Passcode",
    backup_btn: "Backup",
    about_btn: "About",
    search_topics: "Search topics",
    edit_topics: "Edit topics",
    delete_entry: "Delete Entry",
    discard_draft: "Discard Draft",
    save_entry: "Save Entry",
    location: "Location",
    attach_photo: "Attach Photo",
    movie_phrases: "Movie Phrases & Stats",
    loading: "MyDiary is loading",
    confirm_location: (city) => `Confirm or enter your location:`,
    gps_failed: "GPS failed. Enter location manually (e.g. Itomori, Tokyo):",
    geolocation_unsupported: "Geolocation not supported. Enter location manually:"
  },
  ja: {
    entries: "エントリー",
    calendar: "カレンダー",
    diary: "日記",
    no_title: "タイトルなし",
    diary_title_hint: "タイトル",
    diary_content_hint: "タップして本文を記入",
    no_location: "位置情報が取得できません",
    about: "情報",
    theme: "テーマ",
    theme_hint: "テーマを選択",
    your_name: "名前",
    sec_color: "サブカラー",
    main_color: "メインカラー",
    profile_bg: "プロフィールの背景",
    apply: "適用",
    language: "言語",
    language_hint: "言語を選択",
    system: "システム",
    remove_lock: "ロックを解除",
    set_passcode: "パスコードを入力",
    export: "エクスポート",
    import: "インポート",
    add_topic: "トピックを追加",
    topic_name: "トピック名",
    cancel: "キャンセル",
    ok: "OK",
    entries_count: (count) => `${count} エントリー`,
    photo_overview: "写真一覧",
    no_photos: "画像がありません。",
    view_diary_entry: "日記を表示",
    add_contact: "連絡先を追加",
    name: "名前",
    phone: "電話番号",
    delete_contact_confirm: "この連絡先を削除しますか?",
    delete_topic_confirm: (title) => `トピック「${title}」を削除してもよろしいですか？すべてのデータが削除されます。`,
    rename_topic_prompt: (title) => `「${title}」の新しい名前を入力してください：`,
    discard_draft_confirm: "編集中の日記を破棄してもよろしいですか？",
    delete_entry_confirm: "このエントリーを削除しますか?",
    add: "追加",
    enter_passcode: "パスコードを入力",
    create_passcode: "新しいパスコードを入力",
    confirm_passcode: "もう一度入力",
    enter_passcode_to_unlock: "パスコードを入力してロックを解除",
    wrong_passcode: "パスコードが一致しません。",
    passcode_not_match: "パスコードが一致しません。",
    backup: "バックアップ",
    add_topic_btn: "トピックを追加",
    settings_btn: "設定",
    passcode_btn: "パスコード",
    backup_btn: "バックアップ",
    about_btn: "情報",
    search_topics: "トピックを検索",
    edit_topics: "トピックの編集",
    delete_entry: "日記の削除",
    discard_draft: "下書きを破棄",
    save_entry: "日記の保存",
    location: "位置情報",
    attach_photo: "写真を添付",
    movie_phrases: "映画の名台詞",
    loading: "MyDiaryを読み込み中",
    confirm_location: (city) => `位置情報を確認または入力してください：`,
    gps_failed: "GPS取得失敗。手動で位置情報を入力してください (例: 糸守, 東京):",
    geolocation_unsupported: "位置情報取得に対応していません。手動で入力してください:"
  }
};

const initialData = {
  version: 4, // Incremented version to ensure fresh initialization of detailed movie rules
  theme: "taki",
  userName: "立花 瀧",
  locked: false,
  topics: [
    { id: "contacts", type: "contacts", title: "緊急時以外かけちゃダメ！", count: 1 },
    { id: "diary", type: "diary", title: "DIARY", count: 5 },
    { id: "rules", type: "memo", title: "禁止事項 Ver.5", count: 6 },
    { id: "absolute", type: "memo", title: "ゼッタイ禁止", count: 5 },
  ],
  entries: [
    { id: 1, day: 11, weekday: "Fri", date: "2016-11-11", time: "16:21", title: "バイト", content: "東京生活にも慣れてきた。バイトも順調。", summary: "東京生活にも慣れてきた。", mood: "soso", weather: "cloud", location: "Tokyo", photos: [] },
    { id: 2, day: 9, weekday: "Fri", date: "2016-11-09", time: "21:12", title: "東京生活3❤", content: "お台場で奥寺先輩、司、高木とデート（？）をした！めちゃくちゃ楽しかった！", summary: "お台場で奥寺先輩、司、高木と。", mood: "happy", weather: "sunny", location: "Tokyo", photos: [] },
    { id: 3, day: 8, weekday: "Thu", date: "2016-11-08", time: "12:05", title: "中間テスト開始", content: "全然勉強してないのにテストが始まってしまった。どうしよう。", summary: "全然勉強してない...", mood: "soso", weather: "cloud", location: "Itomori", photos: [] },
    { id: 4, day: 7, weekday: "Wed", date: "2016-11-07", time: "21:58", title: "東京生活2❤", content: "初❤奥寺先輩と東京でディナー。ちょっと緊張したけど、先輩は優しかった！", summary: "初❤奥寺先輩と東京でディナー。", mood: "happy", weather: "windy", location: "Roppongi", photos: [] },
    { id: 5, day: 6, weekday: "Tue", date: "2016-11-06", time: "07:12", title: "No Title", content: "朝起きたら、知らない部屋にいた。夢だと思ったけど...", summary: "朝起きたら、知らない部屋にいた。", mood: "soso", weather: "cloud", location: "", photos: [] },
  ],
  memos: [
    { id: 1, topicId: "rules", text: "無駄つかい禁止！", checked: true },
    { id: 2, topicId: "rules", text: "訛り禁止！", checked: false },
    { id: 3, topicId: "rules", text: "遅刻するな！", checked: true },
    { id: 4, topicId: "rules", text: "女言葉NG！", checked: false },
    { id: 5, topicId: "rules", text: "奧寺先輩と馴れ馴れしくするな.....", checked: false },
    { id: 6, topicId: "rules", text: "司とベタベタするな.....", checked: true },
    { id: 7, topicId: "absolute", text: "体を触るな！", checked: false },
    { id: 8, topicId: "absolute", text: "お風呂に入る時は目をつぶれ！", checked: true },
    { id: 9, topicId: "absolute", text: "他人の体を勝手に動かすな！", checked: false },
    { id: 10, topicId: "absolute", text: "みつはの友達と仲良くするな！", checked: false },
    { id: 11, topicId: "absolute", text: "男子禁制！", checked: true },
  ],
  contacts: [{ id: 1, name: "宮水 三葉", phone: "090-0000-0000" }],
};

const assetNames = [
  "contacts_bg_mitsuha.png", "contacts_bg_taki.png", "ic_add_a_photo_white_36dp.png", "ic_add_white_24dp.png",
  "ic_add_white_36dp.png", "ic_attach.png", "ic_backspace_black_24dp.png", "ic_backup_white_36dp.png",
  "ic_bookmark_border.png", "ic_cancel_black_24dp.png", "ic_clear_white_24dp.png", "ic_clear_white_36dp.png",
  "ic_delete_white_24dp.png", "ic_delete_white_36dp.png", "ic_enhanced_encryption_white_36dp.png",
  "ic_error_outline_black_36dp.png", "ic_error_outline_white_48dp.png", "ic_keyboard_arrow_down_black_24dp.png",
  "ic_keyboard_arrow_down_black_36dp.png", "ic_keyboard_arrow_right_black_24dp.png", "ic_location_off_white_24dp.png",
  "ic_location_on_white_24dp.png", "ic_memo_dot_24dp.png", "ic_memo_swap_vert_black_24dp.png",
  "ic_menu_white_24dp.png", "ic_mode_edit_cancel_white_24dp.png", "ic_mode_edit_white_24dp.png",
  "ic_mode_edit_white_36dp.png", "ic_mood_happy.png", "ic_mood_soso.png", "ic_mood_unhappy.png",
  "ic_more_horiz_white_24dp.png", "ic_no_encryption_white_36dp.png", "ic_password_dot_48dp.png",
  "ic_password_no_text_48dp.png", "ic_perm_device_information_white_36dp.png", "ic_person_picture_default.png",
  "ic_photo_camera_white_24dp.png", "ic_photo_library_white_36dp.png", "ic_photo_overview_loading.png",
  "ic_photo_white_24dp.png", "ic_save_white_24dp.png", "ic_search_white_18dp.png",
  "ic_settings_black_24dp.png", "ic_settings_white_36dp.png", "ic_topic_contacts.png",
  "ic_topic_diary.png", "ic_topic_memo.png", "ic_weather_cloud.png", "ic_weather_foggy.png",
  "ic_weather_rainy.png", "ic_weather_snowy.png", "ic_weather_sunny.png", "ic_weather_windy.png",
  "iv_init_logo.png", "profile_theme_bg_mitsuha.png", "profile_theme_bg_taki.png",
  "theme_bg_mitsuha.png", "theme_bg_taki.png", "diary_calendar_arr_shadow.png",
];

function Icon({ name, alt = "", className = "", style = {} }) {
  return <img className={`icon ${className}`} src={`${A}${name}`} alt={alt} style={style} />;
}

function useDiaryData() {
  const [data, setData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mydiary-faithful"));
      return saved?.version >= initialData.version ? saved : initialData;
    } catch {
      return initialData;
    }
  });
  useEffect(() => localStorage.setItem("mydiary-faithful", JSON.stringify(data)), [data]);
  return [data, setData];
}

function App() {
  const [data, setData] = useDiaryData();
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [screen, setScreen] = useState("home");
  const [prevScreen, setPrevScreen] = useState(null);
  const [transDir, setTransDir] = useState("forward"); // "forward" | "back"
  const [transitioning, setTransitioning] = useState(false);

  const animatedSetScreen = useCallback((next, direction = "forward") => {
    if (next === screen) return;
    setPrevScreen(screen);
    setTransDir(direction);
    setTransitioning(true);
    setScreen(next);
    // After the CSS animation ends, clean up
    window.setTimeout(() => {
      setTransitioning(false);
      setPrevScreen(null);
    }, 320);
  }, [screen]);

  const goHome = useCallback(() => animatedSetScreen("home", "back"), [animatedSetScreen]);

  // Swipe-from-left-edge to go back on mobile
  const goHomeRef = useRef(null);
  goHomeRef.current = screen !== "home" ? goHome : null;
  useSwipeBack(goHomeRef);
  const [topic, setTopic] = useState(null);
  const [diaryTab, setDiaryTab] = useState("entries");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Topic adding / editing mode states
  const [addingTopic, setAddingTopic] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Security Lock states
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [securityMode, setSecurityMode] = useState(null); // 'create' | 'remove' | null

  const theme = THEMES[data.theme] || THEMES.taki;
  const style = {
    "--theme": theme.main,
    "--theme-dark": theme.dark,
    "--theme-bg": `url(${theme.background})`,
    "--profile-bg": `url(${theme.profile})`,
    "--contacts-bg": `url(${theme.contacts})`,
  };

  const openTopic = (item) => {
    setTopic(item);
    animatedSetScreen(item.type, "forward");
    if (item.type === "diary") setDiaryTab("entries");
  };

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setSplashLeaving(true), 1050);
    const hideTimer = window.setTimeout(() => setSplashVisible(false), 1400);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  // Calculate dynamic count for each topic
  const getTopicCount = (t) => {
    if (t.type === "diary") {
      return data.entries.length;
    }
    if (t.type === "contacts") {
      return data.contacts.length;
    }
    if (t.type === "memo") {
      return data.memos.filter((memo) => (memo.topicId || "rules") === t.id).length;
    }
    return 0;
  };

  const currentLang = data.language === "system" || !data.language
    ? (navigator.language?.startsWith("ja") ? "ja" : "en")
    : data.language;

  const t = (key, ...args) => {
    const entry = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
    if (typeof entry === "function") {
      return entry(...args);
    }
    return entry;
  };

  const showLockScreen = data.locked && !appUnlocked;

  return (
    <div className="site" style={style}>
      <div className="android-app">
        <StatusBar locked={data.locked} />
        {showLockScreen ? (
          <LockScreen
            t={t}
            mode="unlock"
            expectedPin={data.password}
            onComplete={() => setAppUnlocked(true)}
          />
        ) : (
          <>
            {/* --- Animated screen container --- */}
            {(() => {
              const screensToRender = [screen];
              if (transitioning && prevScreen && prevScreen !== screen) {
                screensToRender.push(prevScreen);
              }

              const getAnimClass = (s) => {
                if (!transitioning) return "screen-enter-done";
                if (s === screen) {
                  // incoming screen
                  return transDir === "forward" ? "screen-enter-forward" : "screen-enter-back";
                }
                // outgoing screen
                return transDir === "forward" ? "screen-exit-forward" : "screen-exit-back";
              };

              const renderScreen = (s) => {
                switch (s) {
                  case "home":
                    return (
                      <Home
                        data={data}
                        setData={setData}
                        openTopic={openTopic}
                        openSettings={() => setSettingsOpen(true)}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        getTopicCount={getTopicCount}
                        t={t}
                      />
                    );
                  case "diary":
                    return (
                      <Diary
                        data={data}
                        setData={setData}
                        title={topic?.title || "DIARY"}
                        tab={diaryTab}
                        setTab={setDiaryTab}
                        selected={selectedEntry}
                        setSelected={setSelectedEntry}
                        goHome={goHome}
                        t={t}
                        currentLang={currentLang}
                      />
                    );
                  case "memo":
                    return (
                      <Memo
                        data={data}
                        setData={setData}
                        topicId={topic?.id}
                        title={topic?.title || "禁止事項 Ver.5"}
                        goHome={goHome}
                        t={t}
                      />
                    );
                  case "contacts":
                    return (
                      <Contacts
                        data={data}
                        setData={setData}
                        title={topic?.title || "Contacts"}
                        goHome={goHome}
                        t={t}
                      />
                    );
                  case "settings":
                    return (
                      <Settings
                        data={data}
                        setData={setData}
                        goHome={goHome}
                        openAbout={() => animatedSetScreen("about", "forward")}
                        onToggleLock={() => {
                          if (data.locked) {
                            setSecurityMode("remove");
                          } else {
                            setSecurityMode("create");
                          }
                        }}
                        t={t}
                      />
                    );
                  case "about":
                    return <About goHome={goHome} t={t} />;
                  default:
                    return null;
                }
              };

              return screensToRender.map((s) => (
                <div key={s} className={`screen-transition-wrapper ${getAnimClass(s)}`}>
                  {renderScreen(s)}
                </div>
              ));
            })()}

            {settingsOpen && (
              <QuickSettings
                data={data}
                setData={setData}
                close={() => setSettingsOpen(false)}
                open={(next) => { animatedSetScreen(next, "forward"); setSettingsOpen(false); }}
                onAddTopic={() => { setAddingTopic(true); setSettingsOpen(false); }}
                onToggleLock={() => {
                  if (data.locked) {
                    setSecurityMode("remove");
                  } else {
                    setSecurityMode("create");
                  }
                  setSettingsOpen(false);
                }}
                t={t}
              />
            )}

            {addingTopic && (
              <AddTopicDialog
                close={() => setAddingTopic(false)}
                save={(title, type) => {
                  const newTopic = {
                    id: `topic_${Date.now()}`,
                    type,
                    title,
                    count: 0
                  };
                  setData({ ...data, topics: [...data.topics, newTopic] });
                  setAddingTopic(false);
                }}
                t={t}
              />
            )}

            {securityMode === "create" && (
              <LockScreen
                t={t}
                mode="create"
                onComplete={(newPin) => {
                  setData({ ...data, locked: true, password: newPin });
                  setSecurityMode(null);
                  setAppUnlocked(true);
                }}
                onCancel={() => setSecurityMode(null)}
              />
            )}

            {securityMode === "remove" && (
              <LockScreen
                t={t}
                mode="remove"
                expectedPin={data.password}
                onComplete={() => {
                  setData({ ...data, locked: false, password: "" });
                  setSecurityMode(null);
                }}
                onCancel={() => setSecurityMode(null)}
              />
            )}
          </>
        )}

        {splashVisible && <SplashScreen leaving={splashLeaving} />}
      </div>
    </div>
  );
}

function SplashScreen({ leaving }) {
  return (
    <div className={`splash-screen ${leaving ? "leaving" : ""}`} aria-label="MyDiary is loading">
      <img src={`${A}iv_init_logo.png`} alt="MyDiary" />
      <img className="splash-loader" src={`${A}ic_photo_overview_loading.png`} alt="" aria-hidden="true" />
    </div>
  );
}

/** Detects swipe-from-left-edge gesture on touch devices and fires the callback stored in the ref. */
function useSwipeBack(callbackRef) {
  useEffect(() => {
    const EDGE_THRESHOLD = 30;   // px from left edge to start tracking
    const MIN_DISTANCE = 60;     // min horizontal travel to trigger
    const MAX_Y_DRIFT = 80;      // max vertical drift allowed
    let tracking = false;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e) => {
      if (!callbackRef.current) return;
      const touch = e.touches[0];
      if (touch.clientX <= EDGE_THRESHOLD) {
        tracking = true;
        startX = touch.clientX;
        startY = touch.clientY;
      }
    };

    const onTouchEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dx >= MIN_DISTANCE && dy <= MAX_Y_DRIFT && callbackRef.current) {
        callbackRef.current();
      }
    };

    const onTouchCancel = () => { tracking = false; };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [callbackRef]);
}

function StatusBar({ locked }) {
  const [time, setTime] = useState(() => new Date());
  const [online, setOnline] = useState(() => navigator.onLine);
  const [connection, setConnection] = useState(() => navigator.connection?.effectiveType || "4g");
  const [battery, setBattery] = useState({ level: 1, charging: false });
  const [locationActive, setLocationActive] = useState(false);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    const timer = window.setInterval(updateTime, 1000);
    const updateOnline = () => setOnline(navigator.onLine);
    const network = navigator.connection;
    const updateConnection = () => setConnection(network?.effectiveType || "4g");

    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    network?.addEventListener?.("change", updateConnection);

    let batteryManager;
    const updateBattery = () => setBattery({
      level: batteryManager?.level ?? 1,
      charging: batteryManager?.charging ?? false,
    });
    navigator.getBattery?.().then((manager) => {
      batteryManager = manager;
      updateBattery();
      manager.addEventListener("levelchange", updateBattery);
      manager.addEventListener("chargingchange", updateBattery);
    }).catch(() => {});

    navigator.permissions?.query({ name: "geolocation" }).then((permission) => {
      const updateLocation = () => setLocationActive(permission.state === "granted");
      updateLocation();
      permission.addEventListener?.("change", updateLocation);
    }).catch(() => {});

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      network?.removeEventListener?.("change", updateConnection);
      batteryManager?.removeEventListener("levelchange", updateBattery);
      batteryManager?.removeEventListener("chargingchange", updateBattery);
    };
  }, []);

  const signalBars = connection === "slow-2g" ? 1 : connection === "2g" ? 2 : connection === "3g" ? 4 : 5;
  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const batteryPercent = Math.round(battery.level * 100);

  return (
    <div className="status-bar">
      <div className="status-left">
        {online ? (
          <>
            <StatusSignal strength={signalBars} />
            <StatusWifi />
          </>
        ) : (
          <StatusAirplane />
        )}
      </div>
      <time dateTime={time.toISOString()}>{formattedTime}</time>
      <div className="status-right">
        {locked && <StatusLock />}
        {locationActive && <StatusLocation />}
        <StatusAlarm />
        <StatusBluetooth />
        <StatusBattery percent={batteryPercent} charging={battery.charging} />
      </div>
    </div>
  );
}

function StatusSignal({ strength }) {
  return (
    <svg className="status-svg signal-svg" viewBox="0 0 29 8" role="img" aria-label={`${strength} bars of signal`}>
      {[2.5, 8.5, 14.5, 20.5, 26.5].map((cx, index) => {
        const isFilled = index < strength;
        return isFilled ? (
          <circle key={cx} cx={cx} cy="4" r="2.2" fill="currentColor" stroke="none" />
        ) : (
          <circle key={cx} cx={cx} cy="4" r="1.7" fill="none" stroke="currentColor" strokeWidth="1" />
        );
      })}
    </svg>
  );
}

function StatusWifi() {
  return (
    <svg className="status-svg wifi-svg" viewBox="0 0 18 13" role="img" aria-label="Wi-Fi connected">
      <path d="M1.5 4 C 5.5 0, 12.5 0, 16.5 4" fill="none" />
      <path d="M4.2 6.7 C 7 4.2, 11 4.2, 13.8 6.7" fill="none" />
      <path d="M6.8 9.3 C 8 8.1, 10 8.1, 11.2 9.3" fill="none" />
      <circle cx="9" cy="11.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StatusAirplane() {
  return (
    <svg className="status-svg airplane-svg" viewBox="0 0 16 16" role="img" aria-label="Airplane mode">
      <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849m.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1s-.458.158-.678.599" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StatusLock() {
  return (
    <svg className="status-svg lock-svg" viewBox="0 0 12 14" role="img" aria-label="Diary locked">
      <path d="M 3.5 6 V 4.2 A 2.5 2.5 0 0 1 8.5 4.2 V 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="2" y="6" width="8" height="6.5" rx="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StatusLocation() {
  return (
    <svg className="status-svg location-svg" viewBox="0 0 12 12" role="img" aria-label="Location active">
      <path d="M 11 1 L 1.5 5 L 6 6 L 7 10.5 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Alarm, Bluetooth, Battery SVGs
function StatusAlarm() {
  return (
    <svg className="status-svg alarm-svg" viewBox="0 0 14 14" role="img" aria-label="Alarm">
      <circle cx="7" cy="7.8" r="4.2" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path d="M 7 5.2 V 7.8 H 9.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M 3.2 4.2 A 1.5 1.5 0 0 1 4.8 5.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M 10.8 4.2 A 1.5 1.5 0 0 0 9.2 5.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M 4.5 11.5 L 3.5 13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M 9.5 11.5 L 10.5 13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function StatusBluetooth() {
  return (
    <svg className="status-svg bluetooth-svg" viewBox="0 0 10 16" role="img" aria-label="Bluetooth">
      <path d="M 2.5 5.5 L 7.5 10.5 L 5 13 V 3 L 7.5 5.5 L 2.5 10.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBattery({ percent, charging }) {
  return (
    <svg className="status-svg battery-svg" viewBox="0 0 26 12" role="img" aria-label={`Battery ${percent}%`}>
      <rect x="0.75" y="1.25" width="21" height="9.5" rx="1.8" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M 23 4 A 1.5 1.5 0 0 1 24.5 5.5 V 6.5 A 1.5 1.5 0 0 1 23 8" fill="currentColor" stroke="none" />
      <rect x="2.25" y="2.75" width={18 * percent / 100} height="6.5" rx="0.5" fill="currentColor" stroke="none" />
      {charging && <path className="battery-bolt" d="M 12.5 1.8 L 9.5 6 H 11.5 L 10.5 10.2 L 13.5 6 H 11.5 Z" fill="#fff" stroke="none" />}
    </svg>
  );
}

function Home({ data, setData, openTopic, openSettings, editMode, setEditMode, getTopicCount, t }) {
  const [query, setQuery] = useState("");
  const topics = data.topics.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleDeleteTopic = (topic) => {
    if (window.confirm(t("delete_topic_confirm", topic.title))) {
      setData({
        ...data,
        topics: data.topics.filter(t => t.id !== topic.id),
        memos: data.memos.filter(m => m.topicId !== topic.id)
      });
    }
  };

  const handleRenameTopic = (topic) => {
    const newName = prompt(t("rename_topic_prompt", topic.title), topic.title);
    if (newName && newName.trim()) {
      setData({
        ...data,
        topics: data.topics.map(t => t.id === topic.id ? { ...t, title: newName.trim() } : t)
      });
    }
  };

  return (
    <main className="screen home-screen">
      <button className="profile-header" onClick={openSettings}>
        <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
        <span className="profile-name">{data.userName}</span>
      </button>
      <section className="topic-list">
        {topics.map((item, idx) => (
          <TopicRow
            key={item.id}
            item={item}
            count={getTopicCount(item)}
            onClick={() => openTopic(item)}
            editMode={editMode}
            onDelete={handleDeleteTopic}
            onRename={handleRenameTopic}
            index={idx}
          />
        ))}
      </section>
      <div className="home-search-bar">
        <label className="native-search">
          <Icon name="ic_search_white_18dp.png" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={t("search_topics")} placeholder={t("search_topics")} />
        </label>
        <button onClick={() => setEditMode(!editMode)} aria-label={t("edit_topics")} style={{ marginRight: '5px' }}>
          <Icon name={editMode ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} style={{ filter: editMode ? 'none' : 'invert(1)' }} />
        </button>
        <button onClick={openSettings} aria-label={t("settings_btn")}><Icon name="ic_settings_black_24dp.png" /></button>
      </div>
    </main>
  );
}

function TopicRow({ item, onClick, count, editMode, onDelete, onRename, index = 0 }) {
  const icon = item.type === "diary" ? "ic_topic_diary.png" : item.type === "contacts" ? "ic_topic_contacts.png" : "ic_topic_memo.png";
  return (
    <div className="topic-row-wrapper anim-stagger-item" style={{ "--stagger-i": index }}>
      <button className="topic-row" onClick={editMode ? undefined : onClick} style={{ flex: 1 }}>
        <Icon name={icon} />
        <span>{item.title}</span>
        <small>{count}</small>
        {!editMode && <Icon name="ic_keyboard_arrow_right_black_24dp.png" />}
      </button>
      {editMode && (
        <div className="topic-edit-actions" style={{ display: 'flex', gap: '5px', paddingRight: '15px' }}>
          <button onClick={() => onRename(item)} aria-label="Rename topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_mode_edit_white_24dp.png" style={{ filter: 'invert(0.5)' }} />
          </button>
          <button onClick={() => onDelete(item)} aria-label="Delete topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_cancel_black_24dp.png" />
          </button>
        </div>
      )}
    </div>
  );
}

function Diary({ data, setData, title, tab, setTab, selected, setSelected, goHome, t, currentLang }) {
  const openEntry = (entry) => {
    setSelected(entry);
    setTab("editor");
    setPhotoOverviewOpen(false);
  };

  const [photoOverviewOpen, setPhotoOverviewOpen] = useState(false);
  const [selectedOverviewPhoto, setSelectedOverviewPhoto] = useState(null);

  return (
    <main className="screen diary-screen">
      <header className="diary-header">
        <button className="screen-back" onClick={photoOverviewOpen ? () => setPhotoOverviewOpen(false) : goHome} aria-label="Back">‹</button>
        <div className="native-segmented">
          <button className={tab === "entries" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("entries"); setPhotoOverviewOpen(false); }}>{t("entries")}</button>
          <button className={tab === "calendar" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("calendar"); setPhotoOverviewOpen(false); }}>{t("calendar")}</button>
          <button className={tab === "editor" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("editor"); setPhotoOverviewOpen(false); }}>{t("diary")}</button>
        </div>
        <div className="diary-topic-title">{photoOverviewOpen ? t("photo_overview") : title}</div>
      </header>
      
      {photoOverviewOpen ? (
        <PhotoOverview
          t={t}
          entries={data.entries}
          onSelectPhoto={(photo, entry) => setSelectedOverviewPhoto({ photo, entry })}
        />
      ) : (
        <div className="diary-content">
          {tab === "entries" && <EntryList entries={data.entries} openEntry={openEntry} t={t} currentLang={currentLang} />}
          {tab === "calendar" && <Calendar entries={data.entries} openEntry={openEntry} t={t} currentLang={currentLang} />}
          {tab === "editor" && <DiaryEditor entry={selected} data={data} setData={setData} close={() => setTab("entries")} t={t} currentLang={currentLang} />}
        </div>
      )}

      {tab !== "editor" && !photoOverviewOpen && (
        <BottomBar>
          <button onClick={goHome}><Icon name="ic_menu_white_24dp.png" /></button>
          <button onClick={() => { setSelected(null); setTab("editor"); }}><Icon name="ic_mode_edit_white_24dp.png" /></button>
          <button onClick={() => setPhotoOverviewOpen(true)}><Icon name={tab === "calendar" ? "ic_photo_camera_white_24dp.png" : "ic_photo_white_24dp.png"} /></button>
          {tab === "entries" && <span className="entry-count">{t("entries_count", data.entries.length)}</span>}
        </BottomBar>
      )}

      {selectedOverviewPhoto && (
        <PhotoViewerModal
          t={t}
          currentLang={currentLang}
          item={selectedOverviewPhoto}
          close={() => setSelectedOverviewPhoto(null)}
          viewEntry={openEntry}
        />
      )}
    </main>
  );
}

function EntryList({ entries, openEntry, t, currentLang }) {
  const grouped = entries.reduce((result, entry) => {
    const month = new Date(`${entry.date}T00:00:00`).toLocaleDateString(currentLang, { month: "short" });
    if (!result[month]) result[month] = [];
    result[month].push(entry);
    return result;
  }, {});
  let flatIdx = 0;
  return (
    <section className="entry-list">
      {Object.entries(grouped).map(([month, monthEntries]) => (
        <div key={month}>
          <div className="entry-month anim-stagger-item" style={{ "--stagger-i": flatIdx }}>{month}</div>
          {monthEntries.map((entry) => {
            const i = ++flatIdx;
            return (
              <button className="entry-card anim-stagger-item" key={entry.id} onClick={() => openEntry(entry)} style={{ "--stagger-i": i }}>
                <time><b>{entry.day}</b><span>{entry.weekday || new Date(`${entry.date}T00:00:00`).toLocaleDateString(currentLang, { weekday: "short" })}</span></time>
                <div className="entry-copy"><small>{entry.time}</small><strong>{entry.title || t("no_title")}</strong><span>{entry.summary ?? entry.content ?? entry.location ?? ""}</span></div>
                <div className="entry-icons">
                  <span><Icon name={`ic_weather_${entry.weather}.png`} /><Icon name={`ic_mood_${entry.mood}.png`} /><Icon name="ic_bookmark_border.png" /></span>
                  {entry.photos && entry.photos.length > 0 && <Icon name="ic_attach.png" />}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function Calendar({ entries, openEntry, t, currentLang }) {
  const [viewDate, setViewDate] = useState(() => {
    if (entries.length > 0) {
      return new Date(entries[0].date);
    }
    return new Date();
  });
  const [calendarMode, setCalendarMode] = useState("month");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevAction = () => {
    if (calendarMode === "week") {
      const prevWeek = new Date(viewDate);
      prevWeek.setDate(viewDate.getDate() - 7);
      setViewDate(prevWeek);
    } else {
      setViewDate(new Date(year, month - 1, 1));
    }
  };

  const nextAction = () => {
    if (calendarMode === "week") {
      const nextWeek = new Date(viewDate);
      nextWeek.setDate(viewDate.getDate() + 7);
      setViewDate(nextWeek);
    } else {
      setViewDate(new Date(year, month + 1, 1));
    }
  };

  const formattedMonthName = viewDate.toLocaleDateString(currentLang, { month: "long" });

  const weekdays = currentLang === "ja"
    ? ["日", "月", "火", "水", "木", "金", "土"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Helper to render the day cells
  const renderDays = () => {
    if (calendarMode === "month") {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay();

      const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
      const spacers = Array.from({ length: startDayOfWeek }, (_, index) => index);

      return (
        <>
          {spacers.map((val) => <i key={`spacer-${val}`} />)}
          {days.map((day) => {
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const datePattern = `${year}-${monthStr}-${dayStr}`;
            
            const entry = entries.find((item) => item.date === datePattern);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <button
                key={day}
                className={`${entry ? "marked" : ""} ${isToday ? "today-cell" : ""}`}
                onClick={() => entry && openEntry(entry)}
              >
                {day}
                {entry && <span />}
              </button>
            );
          })}
        </>
      );
    } else {
      // Week mode: Show the 7 days of the week containing viewDate
      const currentDayOfWeek = viewDate.getDay();
      const sunday = new Date(viewDate);
      sunday.setDate(viewDate.getDate() - currentDayOfWeek);

      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d;
      });

      return weekDates.map((dayDate, idx) => {
        const y = dayDate.getFullYear();
        const m = String(dayDate.getMonth() + 1).padStart(2, '0');
        const d = String(dayDate.getDate()).padStart(2, '0');
        const datePattern = `${y}-${m}-${d}`;

        const entry = entries.find((item) => item.date === datePattern);
        const isToday = new Date().toDateString() === dayDate.toDateString();
        const isSelected = viewDate.toDateString() === dayDate.toDateString();

        return (
          <button
            key={idx}
            className={`${entry ? "marked" : ""} ${isToday ? "today-cell" : ""} ${isSelected ? "selected-cell" : ""}`}
            onClick={() => {
              setViewDate(dayDate);
              if (entry) openEntry(entry);
            }}
          >
            {dayDate.getDate()}
            {entry && <span />}
          </button>
        );
      });
    }
  };

  return (
    <section className="calendar-view">
      <div className="calendar-month">
        <button onClick={prevAction}>‹</button>
        <span>
          <small>{year}</small>
          {formattedMonthName}
        </span>
        <button onClick={nextAction}>›</button>
      </div>
      <div className="week-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="day-grid">
        {renderDays()}
      </div>
      <button 
        className={`calendar-mode ${calendarMode === "month" ? "month-mode" : "week-mode"}`} 
        onClick={() => setCalendarMode(calendarMode === "month" ? "week" : "month")}
        aria-label="Toggle calendar mode"
      >
        <Icon name="ic_keyboard_arrow_down_black_24dp.png" />
      </button>
    </section>
  );
}

const TextareaBlock = ({ value, onChange, onFocus, onBlur, placeholder }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        border: "none",
        outline: "none",
        resize: "none",
        fontFamily: "inherit",
        fontSize: "15px",
        padding: "8px",
        overflow: "hidden",
        background: "transparent",
        minHeight: "45px"
      }}
    />
  );
};

function DiaryEditor({ entry, data, setData, close, t, currentLang }) {
  const createDraft = () => ({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    day: new Date().getDate(),
    time: new Date().toTimeString().slice(0, 5),
    title: "",
    content: "",
    mood: "happy",
    weather: "sunny",
    location: "No Location",
    photos: [],
    items: [{ id: "text_0", type: "text", value: "" }]
  });

  const [draft, setDraft] = useState(entry || createDraft());
  const [items, setItems] = useState([]);
  const [activeTextarea, setActiveTextarea] = useState({ id: null, selectionStart: 0 });

  useEffect(() => {
    if (entry) {
      setDraft({ ...entry, photos: entry.photos || [] });
      setItems(entry.items || [{ id: "text_0", type: "text", value: entry.content || "" }]);
      setActiveTextarea({ id: entry.items?.[0]?.id || "text_0", selectionStart: 0 });
    } else {
      const freshDraft = createDraft();
      setDraft(freshDraft);
      setItems([{ id: "text_0", type: "text", value: "" }]);
      setActiveTextarea({ id: "text_0", selectionStart: 0 });
    }
  }, [entry]);

  const update = (key, value) => setDraft({ ...draft, [key]: value, ...(key === "date" ? { day: new Date(`${value}T00:00:00`).getDate() } : {}) });

  const save = () => {
    const textValues = items.filter(item => item.type === "text").map(item => item.value);
    const hasContent = textValues.some(v => v.trim()) || items.some(item => item.type === "photo");
    if (!draft.title.trim() && !hasContent) return;

    const photoValues = items.filter(item => item.type === "photo").map(item => item.value);
    const contentText = textValues.join("\n");
    const summaryText = textValues[0] || "";

    const updatedEntry = {
      ...draft,
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
    close();
  };

  const remove = () => {
    if (window.confirm(t("delete_entry_confirm"))) {
      setData({ ...data, entries: data.entries.filter((item) => item.id !== draft.id) });
      close();
    }
  };

  const handleClear = () => {
    if (window.confirm(t("discard_draft_confirm"))) {
      setDraft(createDraft());
      setItems([{ id: "text_0", type: "text", value: "" }]);
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
            const userLoc = prompt(t("confirm_location", detectedCity || "Itomori"), detectedCity || "Itomori");
            if (userLoc !== null) {
              update("location", userLoc.trim() || "No Location");
            }
          },
          (error) => {
            console.error(error);
            const userLoc = prompt(t("gps_failed"));
            if (userLoc) {
              update("location", userLoc.trim());
            }
          }
        );
      } else {
        const userLoc = prompt(t("geolocation_unsupported"));
        if (userLoc) {
          update("location", userLoc.trim());
        }
      }
    }
  };

  const fileInputRef = useRef(null);
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      
      setItems(prev => {
        const idx = prev.findIndex(item => item.id === activeTextarea.id);
        if (idx !== -1 && prev[idx].type === "text") {
          const textItem = prev[idx];
          const textVal = textItem.value;
          const splitIdx = activeTextarea.selectionStart;
          const firstPart = textVal.slice(0, splitIdx);
          const secondPart = textVal.slice(splitIdx);
          
          const newText1 = { ...textItem, value: firstPart };
          const newPhoto = { id: `photo_${Date.now()}`, type: "photo", value: base64 };
          const newText2 = { id: `text_${Date.now()}`, type: "text", value: secondPart };
          
          const next = [...prev];
          next.splice(idx, 1, newText1, newPhoto, newText2);
          return next;
        } else {
          return [
            ...prev,
            { id: `photo_${Date.now()}`, type: "photo", value: base64 },
            { id: `text_${Date.now()}`, type: "text", value: "" }
          ];
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
        <label className="editor-date-control">
          <span>{dateText}</span>
          <input type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} aria-label="Diary date" />
        </label>
        <EditorCalendarIcon />
        <b>{draft.day}</b>
        <label className="editor-time-control">
          <span>{timeText}</span>
          <small>{draft.location === "No Location" ? t("no_location") : draft.location}</small>
          <input type="time" value={draft.time} onChange={(event) => update("time", event.target.value)} aria-label="Diary time" />
        </label>
        <EditorClockIcon />
      </div>
      <div className="editor-sheet">
        <div className="editor-title-row">
          <input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder={t("diary_title_hint")} />
          <label><Icon name={`ic_weather_${draft.weather}.png`} /><select value={draft.weather} onChange={(event) => update("weather", event.target.value)}>{["sunny", "cloud", "windy", "rainy", "snowy", "foggy"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><Icon name={`ic_mood_${draft.mood}.png`} /><select value={draft.mood} onChange={(event) => update("mood", event.target.value)}>{["happy", "soso", "unhappy"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        
        <div className="editor-content-blocks" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' }}>
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
            <h4>Insert iconic phrase:</h4>
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

function Memo({ data, setData, topicId, title, goHome, t }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const activeTopicId = topicId || "rules";
  const topicMemos = data.memos.filter((memo) => (memo.topicId || "rules") === activeTopicId);

  const add = () => {
    if (!text.trim()) return;
    setData({ ...data, memos: [...data.memos, { id: Date.now(), text, checked: false, topicId: activeTopicId }] });
    setText("");
  };

  return (
    <main className="screen memo-screen">
      <NativeTitle title={title} goHome={goHome}>
        <button onClick={() => setEditing(!editing)}><Icon name={editing ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} /></button>
      </NativeTitle>
      {editing && <div className="memo-add"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} placeholder={t("add")} /><button onClick={add}><Icon name="ic_add_white_24dp.png" /></button></div>}
      <section className="memo-list">
        {topicMemos.map((memo, idx) => (
          <label key={memo.id} className={`${memo.checked ? "checked" : ""} anim-stagger-item`} style={{ "--stagger-i": idx }}>
            <Icon name="ic_memo_dot_24dp.png" />
            <input type="checkbox" checked={memo.checked} onChange={() => setData({ ...data, memos: data.memos.map((item) => item.id === memo.id ? { ...item, checked: !item.checked } : item) })} />
            <span>{memo.text}</span>
            {editing && <button onClick={() => setData({ ...data, memos: data.memos.filter((item) => item.id !== memo.id) })}><Icon name="ic_cancel_black_24dp.png" /></button>}
          </label>
        ))}
      </section>
    </main>
  );
}

function Contacts({ data, setData, title, goHome, t }) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "" });
  
  const filtered = data.contacts.filter((item) => `${item.name}${item.phone}`.toLowerCase().includes(query.toLowerCase()));
  
  const save = () => {
    if (!draft.name.trim()) return;
    setData({ ...data, contacts: [...data.contacts, { ...draft, id: Date.now() }] });
    setDraft({ name: "", phone: "" });
    setAdding(false);
  };

  const deleteContact = (contactId) => {
    if (window.confirm(t("delete_contact_confirm"))) {
      setData({ ...data, contacts: data.contacts.filter(c => c.id !== contactId) });
    }
  };

  return (
    <main className="screen contacts-screen">
      <header className="contacts-header">
        <button className="contacts-back" onClick={goHome} aria-label="Back">‹</button>
        <span className="contacts-title">{title}</span>
        <button className="contacts-add" onClick={() => setAdding(true)} aria-label={t("add_contact")}><Icon name="ic_add_white_24dp.png" /></button>
        <label className="native-search"><Icon name="ic_search_white_18dp.png" /><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </header>
      <div className="letters">A<br />B<br />C<br />D<br />E<br />F<br />G<br />H<br />I<br />J<br />K<br />L<br />M<br />N<br />O<br />P<br />Q<br />R<br />S<br />T<br />U<br />V<br />W<br />X<br />Y<br />Z</div>
      <section className="contact-list">
        {filtered.map((contact, idx) => (
          <div key={contact.id} className="anim-stagger-item" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cacaca', "--stagger-i": idx }}>
            <a href={`tel:${contact.phone}`} style={{ flex: 1, borderBottom: 'none' }}>
              <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
              <span><b>{contact.name}</b><small>{contact.phone}</small></span>
            </a>
            <button onClick={() => deleteContact(contact.id)} style={{ background: 'transparent', padding: '10px' }} aria-label={t("delete_contact_confirm")}>
              <Icon name="ic_cancel_black_24dp.png" />
            </button>
          </div>
        ))}
      </section>
      {adding && <NativeDialog title="Contact" close={() => setAdding(false)}><input placeholder={t("name")} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /><input placeholder={t("phone")} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /><button onClick={save}>OK</button></NativeDialog>}
    </main>
  );
}

function NativeTitle({ title, goHome, children }) {
  return <header className="native-title"><button className="screen-back" onClick={goHome}>‹</button><span>{title}</span>{children}</header>;
}

function BottomBar({ children }) {
  return <footer className="bottom-bar">{children}</footer>;
}

function QuickSettings({ data, setData, close, open, onAddTopic, onToggleLock, t }) {
  return (
    <div className="sheet-scrim" onMouseDown={close}>
      <div className="quick-sheet" onMouseDown={(event) => event.stopPropagation()}>
        <button onClick={onAddTopic}><Icon name="ic_add_white_36dp.png" /><span>{t("add_topic_btn")}</span></button>
        <button onClick={() => open("settings")}><Icon name="ic_settings_white_36dp.png" /><span>{t("settings_btn")}</span></button>
        <button onClick={onToggleLock}><Icon name={data.locked ? "ic_no_encryption_white_36dp.png" : "ic_enhanced_encryption_white_36dp.png"} /><span>{t("passcode_btn")}</span></button>
        <button onClick={() => open("settings")}><Icon name="ic_backup_white_36dp.png" /><span>{t("backup_btn")}</span></button>
        <button onClick={() => open("about")}><Icon name="ic_perm_device_information_white_36dp.png" /><span>{t("about_btn")}</span></button>
      </div>
    </div>
  );
}

function AddTopicDialog({ close, save, t }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("diary");
  
  const handleSave = () => {
    if (!title.trim()) return;
    save(title.trim(), type);
  };

  return (
    <div className="dialog-scrim" onMouseDown={close}>
      <div className="native-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <h3>{t("add_topic")}</h3>
        <input
          placeholder={t("topic_name")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '15px', padding: '10px 0', fontSize: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input type="radio" checked={type === "diary"} onChange={() => setType("diary")} />
            {t("diary")}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input type="radio" checked={type === "memo"} onChange={() => setType("memo")} />
            {t("memo")}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input type="radio" checked={type === "contacts"} onChange={() => setType("contacts")} />
            {t("contacts")}
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={close}>{t("cancel")}</button>
          <button onClick={handleSave} style={{ color: 'var(--theme-dark)', fontWeight: 'bold' }}>{t("ok")}</button>
        </div>
      </div>
    </div>
  );
}

function PhotoOverview({ entries, onSelectPhoto, t }) {
  const allPhotos = [];
  entries.forEach((entry) => {
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((photo, index) => {
        allPhotos.push({ photo, entry, index });
      });
    }
  });

  return (
    <div className="photo-overview-screen">
      <div className="photo-grid">
        {allPhotos.length === 0 ? (
          <div className="no-photos-msg">{t("no_photos")}</div>
        ) : (
          allPhotos.map((item, idx) => (
            <button key={idx} className="grid-photo-btn" onClick={() => onSelectPhoto(item.photo, item.entry)}>
              <img src={item.photo} alt={`Grid item ${idx + 1}`} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function PhotoViewerModal({ item, close, viewEntry, t, currentLang }) {
  const dateText = currentLang === "ja"
    ? new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) + " (" + new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("ja-JP", { weekday: "short" }) + ")"
    : new Date(`${item.entry.date}T00:00:00`).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  return (
    <div className="viewer-scrim" onClick={close}>
      <div className="viewer-container" onClick={(e) => e.stopPropagation()}>
        <header className="viewer-header">
          <span>{dateText} {item.entry.time} - {item.entry.title || t("no_title")}</span>
          <button className="viewer-close-btn" onClick={close}>×</button>
        </header>
        <div className="viewer-body">
          <img src={item.photo} alt="Large layout preview" />
        </div>
        <footer className="viewer-footer">
          <button className="viewer-action-btn" onClick={() => viewEntry(item.entry)}>{t("view_diary_entry")}</button>
        </footer>
      </div>
    </div>
  );
}

function Settings({ data, setData, goHome, openAbout, onToggleLock, t }) {
  const fileRef = useRef(null);
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mydiary-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { setData(JSON.parse(reader.result)); } catch { window.alert("Import failed"); }
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
        }}><option value="taki">Taki</option><option value="mitsuha">Mitsuha</option></select>
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

function About({ goHome, t }) {
  return (
    <main className="screen about-screen">
      <NativeTitle title={t("about")} goHome={goHome} />
      <div className="about-content">
        <img className="about-logo" src={import.meta.env.BASE_URL + "assets/ic_launcher-web.png"} alt="MyDiary" />
        <h2>MyDiary</h2><p>Responsive web port of the original Android application.</p>
        <a href="https://github.com/DaxiaK/MyDiary" target="_blank" rel="noreferrer">Original GitHub project</a>
        <h3>Original screenshots</h3>
        <div className="screen-gallery">{Array.from({ length: 7 }, (_, index) => <img key={index} src={`${import.meta.env.BASE_URL}assets/screenshots/s_${index}.png`} alt="" />)}</div>
        <h3>Original assets ({assetNames.length})</h3>
        <div className="asset-gallery">{assetNames.map((name) => <img key={name} src={`${A}${name}`} title={name} alt="" />)}</div>
      </div>
    </main>
  );
}

function NativeDialog({ title, close, children }) {
  return <div className="dialog-scrim" onMouseDown={close}><div className="native-dialog" onMouseDown={(event) => event.stopPropagation()}><h3>{title}</h3>{children}</div></div>;
}

const KEYPAD_LETTERS = {
  1: "",
  2: "A B C",
  3: "D E F",
  4: "G H I",
  5: "J K L",
  6: "M N O",
  7: "P Q R S",
  8: "T U V",
  9: "W X Y Z",
  0: ""
};

function LockScreen({ mode, expectedPin, onComplete, onCancel, t }) {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState(() => {
    if (mode === "unlock") return t("enter_passcode");
    if (mode === "create") return t("create_passcode");
    if (mode === "confirm") return t("confirm_passcode");
    if (mode === "remove") return t("enter_passcode_to_unlock");
    return "";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [tempPin, setTempPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleKeyPress = (num) => {
    if (pin.length >= 4) return;
    setErrorMsg("");
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(() => {
        if (mode === "unlock") {
          if (nextPin === expectedPin) {
            onComplete(nextPin);
          } else {
            setErrorMsg(t("wrong_passcode"));
            setPin("");
            triggerShake();
          }
        } else if (mode === "remove") {
          if (nextPin === expectedPin) {
            onComplete();
          } else {
            setErrorMsg(t("wrong_passcode"));
            setPin("");
            triggerShake();
          }
        } else if (tempPin) {
          if (nextPin === tempPin) {
            onComplete(nextPin);
          } else {
            setErrorMsg(t("passcode_not_match"));
            setPin("");
            setTempPin("");
            setMessage(t("create_passcode"));
            triggerShake();
          }
        } else if (mode === "create") {
          setTempPin(nextPin);
          setPin("");
          setMessage(t("confirm_passcode"));
        }
      }, 300);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg("");
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-header">
        <h2>{message}</h2>
        <p style={{ color: "#ff8b80" }}>{errorMsg}</p>
      </div>
      
      <div className={`lock-dots ${isShaking ? "shake" : ""}`}>
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = pin.length > idx;
          return (
            <span
              key={idx}
              className={`lock-dot-circle ${isFilled ? "filled" : ""}`}
            />
          );
        })}
      </div>

      <div className="lock-keyboard">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} className="lock-key" onClick={() => handleKeyPress(num)}>
            <span className="num-val">{num}</span>
            <span className="letters-val">{KEYPAD_LETTERS[num]}</span>
          </button>
        ))}
        {onCancel ? (
          <button className="lock-key action" onClick={onCancel}>{t("cancel")}</button>
        ) : (
          <span className="lock-key empty" />
        )}
        <button className="lock-key" onClick={() => handleKeyPress(0)}>
          <span className="num-val">0</span>
          <span className="letters-val">{KEYPAD_LETTERS[0]}</span>
        </button>
        <button className="lock-key action" onClick={handleBackspace}>
          <Icon name="ic_backspace_black_24dp.png" alt="Backspace" />
        </button>
      </div>
    </div>
  );
}

export default App;
