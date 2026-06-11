import React, { useCallback, useEffect, useRef, useState } from "react";
import CometBackground from "./CometBackground";
import HandwrittenOverlay from "./HandwrittenOverlay";
import {
  loadDiaryState,
  loadDiaryDraft,
  migrateLegacyState,
  requestPersistentStorage,
  replaceDiaryState,
  saveDiaryDraft,
  saveDiaryState,
  deleteDiaryDraft,
  validateDiaryState,
} from "./storage/diaryStore";
import { createPinSecurity, verifyPin } from "./security/pin";
import { createDiaryBackup, parseDiaryBackup } from "./backup/diaryBackup";
import { processDiaryImage } from "./storage/imageProcessing";

const A = import.meta.env.BASE_URL + "assets/icons/";
const HISTORY_KEY = "mydiary-screen";
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
  twilight: {
    name: "Twilight",
    main: "#7c4eb5",
    dark: "#4a2278",
    userName: "忘れたくない人",
    background: `${A}theme_bg_twilight.png`,
    profile: `${A}profile_theme_bg_twilight.png`,
    contacts: `${A}contacts_bg_twilight.png`,
  },
};

const TRANSLATIONS = {
  en: {
    entries: "Entries",
    calendar: "Calendar",
    diary: "Diary",
    no_title: "No Title",
    no_bookmarks: "No bookmarked entries",
    show_all_entries: "Show All Entries",
    diary_title_hint: "Diary title",
    diary_content_hint: "Write your diary here",
    no_location: "No Location",
    about: "About",
    theme: "Theme",
    theme_hint: "Pick your theme",
    your_name: "Your name",
    swap_body: "Swap",
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
    entries_count: (count) => `${count} entry`,
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
    save_failed_empty: "Cannot save an empty entry. Please write a title or content.",
    location: "Location",
    attach_photo: "Attach Photo",
    movie_phrases: "Movie Phrases & Stats",
    loading: "MyDiary is loading",
    confirm_location: (city) => `Confirm or enter your location:`,
    gps_failed: "GPS failed. Enter location manually (e.g. Itomori, Tokyo):",
    geolocation_unsupported: "Geolocation not supported. Enter location manually:",
    memo: "Memo",
    contacts: "Contacts",
    insert_movie_phrase: "Insert iconic phrase:",
    contact_dialog_title: "Contact",
    simulated_call: "Simulated call",
    calling: "Calling...",
    connected: "Connected",
    end_call: "End call",
    call_ended: "Call ended",
    mute: "Mute",
    speaker: "Speaker",
    replay_voice: "Replay audio",
    voice_unavailable: "Licensed Mitsuha call audio has not been installed.",
    import_failed: "Import failed",
    original_github: "Original GitHub project",
    original_screenshots: "Original screenshots",
    original_assets: (count) => `Original assets (${count})`,
    topic_contacts: "緊急時以外かけちゃダメ！",
    topic_diary: "Diary",
    topic_rules: "禁止事項 Ver.5",
    topic_absolute: "ゼッタイ禁止",
    memo_no_spending: "無駄つかい禁止！",
    memo_no_dialects: "訛り禁止！",
    memo_no_lateness: "遅刻するな！",
    memo_no_feminine: "女言葉NG！",
    memo_okudera: "奧寺先輩と馴れ馴れしくするな.....",
    memo_tsukasa: "司とベタベタするな.....",
    memo_body_touching: "体を触るな！",
    memo_bath_eyes: "お風呂に入る時は目をつぶれ！",
    memo_body_moving: "他人の体を勝手に動かすな！",
    memo_mitsuha_friends: "みつはの友達と仲良くするな！",
    memo_boys_prohibited: "男子禁制！",
    entry_title_1: "Part-time Job",
    entry_title_2: "Tokyo Life 3❤",
    entry_title_3: "Midterms Start",
    entry_title_4: "Tokyo Life 2❤",
    entry_content_1: "Getting used to life in Tokyo. The job is going well.",
    entry_content_2: "Date with Okudera-senpai, Tsukasa, and Takagi at Odaiba (?)! It was super fun!",
    entry_content_3: "I haven't studied at all but the exams started. What should I do?",
    entry_content_4: "First dinner with Okudera-senpai in Tokyo. I was a bit nervous but she was nice!",
    entry_content_5: "When I woke up, I was in a strange room. I thought it was a dream...",
    entry_summary_1: "Getting used to life in Tokyo.",
    entry_summary_2: "Date at Odaiba with friends.",
    entry_summary_3: "Exams started...",
    entry_summary_4: "First dinner with Okudera-senpai.",
    entry_summary_5: "Woke up in a strange room."
  },
  ja: {
    entries: "エントリー",
    calendar: "カレンダー",
    diary: "日記",
    no_title: "タイトルなし",
    no_bookmarks: "ブックマークした日記はありません",
    show_all_entries: "すべての日記を表示",
    diary_title_hint: "タイトル",
    diary_content_hint: "タップして本文を記入",
    no_location: "位置情報が取得できません",
    about: "情報",
    theme: "テーマ",
    theme_hint: "テーマを選択",
    your_name: "名前",
    swap_body: "入れ替わり",
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
    entries_count: (count) => `${count} entry`,
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
    save_failed_empty: "空の日記は保存できません。タイトルか本文を入力してください。",
    location: "位置情報",
    attach_photo: "写真を添付",
    movie_phrases: "映画の名台詞",
    loading: "MyDiaryを読み込み中",
    confirm_location: (city) => `位置情報を確認または入力してください：`,
    gps_failed: "GPS取得失敗。手動で位置情報を入力してください (例: 糸守, 東京):",
    geolocation_unsupported: "位置情報取得に対応していません。手動で入力してください:",
    memo: "メモ",
    contacts: "連絡先",
    insert_movie_phrase: "映画の名台詞を挿入：",
    contact_dialog_title: "連絡先",
    simulated_call: "通話シミュレーション",
    calling: "発信中...",
    connected: "通話中",
    end_call: "通話終了",
    call_ended: "通話終了",
    mute: "消音",
    speaker: "スピーカー",
    replay_voice: "もう一度聞く",
    voice_unavailable: "許可された三葉の通話音声がまだ追加されていません。",
    import_failed: "インポートに失敗しました",
    original_github: "オリジナルのGitHubプロジェクト",
    original_screenshots: "オリジナルスクリーンショット",
    original_assets: (count) => `オリジナルアセット (${count})`,
    topic_contacts: "緊急時以外かけちゃダメ！",
    topic_diary: "Diary",
    topic_rules: "禁止事項 Ver.5",
    topic_absolute: "ゼッタイ禁止",
    memo_no_spending: "無駄つかい禁止！",
    memo_no_dialects: "訛り禁止！",
    memo_no_lateness: "遅刻するな！",
    memo_no_feminine: "女言葉NG！",
    memo_okudera: "奧寺先輩と馴れ馴れしくするな.....",
    memo_tsukasa: "司とベタベタするな.....",
    memo_body_touching: "体を触るな！",
    memo_bath_eyes: "お風呂に入る時は目をつぶれ！",
    memo_body_moving: "他人の体を勝手に動かすな！",
    memo_mitsuha_friends: "みつはの友達と仲良くするな！",
    memo_boys_prohibited: "男子禁制！",
    entry_title_1: "バイト",
    entry_title_2: "東京生活3❤",
    entry_title_3: "中間テスト開始",
    entry_title_4: "東京生活2❤",
    entry_content_1: "東京生活にも慣れてきた。バイトも順調。",
    entry_content_2: "お台場で奥寺先輩、司、高木とデート（？）をした！めちゃくちゃ楽しかった！",
    entry_content_3: "全然勉強してないのにテストが始まってしまった。どうしよう。",
    entry_content_4: "初❤奥寺先輩と東京でディナー。ちょっと緊張したけど、先輩は優しかった！",
    entry_content_5: "朝起きたら、知らない部屋にいた。夢だと思ったけど...",
    entry_summary_1: "東京生活にも慣れてきた。",
    entry_summary_2: "お台場で奥寺先輩、司、高木と。",
    entry_summary_3: "全然勉強してない...",
    entry_summary_4: "初❤奥寺先輩と東京でディナー。",
    entry_summary_5: "朝起きたら、知らない部屋にいた。"
  }
};

const initialData = {
  version: 6, // Incremented version to ensure Japanese entries are populated
  theme: "taki",
  userName: "立花 瀧",
  locked: false,
  topics: [
    { id: "contacts", type: "contacts", title: "緊急時以外かけちゃダメ！", count: 1 },
    { id: "diary", type: "diary", title: "Diary", count: 5 },
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

const initialDataEn = {
  version: 6,
  theme: "taki",
  userName: "立花 瀧",
  locked: false,
  topics: initialData.topics,
  entries: initialData.entries,
  memos: initialData.memos,
  contacts: initialData.contacts,
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

function Icon({ name, alt = "", className = "", style = {}, ...props }) {
  return <img className={`icon ${className}`} src={`${A}${name}`} alt={alt} style={style} {...props} />;
}

function FlatList({ data, renderItem, keyExtractor, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </React.Fragment>
      ))}
    </div>
  );
}

const defaultTopicTranslationKeys = {
  "緊急時以外かけちゃダメ！": "topic_contacts",
  "DIARY": "topic_diary",
  "Diary": "topic_diary",
  "禁止事項 Ver.5": "topic_rules",
  "ゼッタイ禁止": "topic_absolute",
  "DON'T CALL UNLESS EMERGENCY!": "topic_contacts",
  "Forbidden Ver.5": "topic_rules",
  "ABSOLUTELY FORBIDDEN": "topic_absolute"
};

const getTranslatedTopicTitle = (title, t) => {
  const key = defaultTopicTranslationKeys[title];
  return key ? t(key) : title;
};

const defaultMemoTranslationKeys = {
  "無駄つかい禁止！": "memo_no_spending",
  "訛り禁止！": "memo_no_dialects",
  "遅刻するな！": "memo_no_lateness",
  "女言葉NG！": "memo_no_feminine",
  "奧寺先輩と馴れ馴れしくするな.....": "memo_okudera",
  "司とベタベタするな.....": "memo_tsukasa",
  "体を触るな！": "memo_body_touching",
  "お風呂に入る時は目をつぶれ！": "memo_bath_eyes",
  "他人の体を勝手に動かすな！": "memo_body_moving",
  "みつはの友達と仲良くするな！": "memo_mitsuha_friends",
  "男子禁制！": "memo_boys_prohibited",
  "No spending money!": "memo_no_spending",
  "No dialects!": "memo_no_dialects",
  "Don't be late!": "memo_no_lateness",
  "No feminine language!": "memo_no_feminine",
  "Don't get too close to Okudera-senpai...": "memo_okudera",
  "Don't cuddle with Tsukasa...": "memo_tsukasa",
  "No touching my body!": "memo_body_touching",
  "Close your eyes when taking a bath!": "memo_bath_eyes",
  "Don't move other people's bodies without permission!": "memo_body_moving",
  "Don't hang out with Mitsuha's friends too much!": "memo_mitsuha_friends",
  "Boys prohibited!": "memo_boys_prohibited"
};

const getTranslatedMemoText = (text, t) => {
  return text;
};

const defaultEntryTranslationKeys = {
  "バイト": "entry_title_1",
  "東京生活3❤": "entry_title_2",
  "中間テスト開始": "entry_title_3",
  "東京生活2❤": "entry_title_4",
  "Part-time Job": "entry_title_1",
  "Tokyo Life 3❤": "entry_title_2",
  "Midterms Start": "entry_title_3",
  "Tokyo Life 2❤": "entry_title_4",
  
  "東京生活にも慣れてきた。バイトも順調。": "entry_content_1",
  "お台場で奥寺先輩、司、高木とデート（？）をした！めちゃくちゃ楽しかった！": "entry_content_2",
  "全然勉強してないのにテストが始まってしまった。どうしよう。": "entry_content_3",
  "初❤奥寺先輩と東京でディナー。ちょっと緊張したけど、先輩は優しかった！": "entry_content_4",
  "朝起きたら、知らない部屋にいた。夢だと思ったけど...": "entry_content_5",
  "Getting used to life in Tokyo. The job is going well.": "entry_content_1",
  "Date with Okudera-senpai, Tsukasa, and Takagi at Odaiba (?)! It was super fun!": "entry_content_2",
  "I haven't studied at all but the exams started. What should I do?": "entry_content_3",
  "First dinner with Okudera-senpai in Tokyo. I was a bit nervous but she was nice!": "entry_content_4",
  "When I woke up, I was in a strange room. I thought it was a dream...": "entry_content_5",

  "東京生活にも慣れてきた。": "entry_summary_1",
  "お台場で奥寺先輩、司、高木と。": "entry_summary_2",
  "全然勉強してない...": "entry_summary_3",
  "初❤奥寺先輩と東京でディナー。": "entry_summary_4",
  "朝起きたら、知らない部屋にいた。": "entry_summary_5",
  "Getting used to life in Tokyo.": "entry_summary_1",
  "Date at Odaiba with friends.": "entry_summary_2",
  "Exams started...": "entry_summary_3",
  "First dinner with Okudera-senpai.": "entry_summary_4",
  "Woke up in a strange room.": "entry_summary_5"
};

const getTranslatedEntryField = (val, t) => {
  return val;
};

function useDiaryData() {
  const [data, setData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mydiary-faithful"));
      if (saved) {
        if (saved.version >= initialData.version) {
          return saved;
        }
        // Safely migrate older versions of the user's data
        const isJa = navigator.language?.startsWith("ja");
        const defaultData = isJa ? initialData : initialDataEn;
        
        // Merge topics to keep any custom user-added topics
        const mergedTopics = [...(saved.topics || [])];
        defaultData.topics.forEach(defaultT => {
          if (!mergedTopics.some(t => t.id === defaultT.id)) {
            mergedTopics.push(defaultT);
          }
        });

        // Revert any default English entries to Japanese
        const migratedEntries = (saved.entries || []).map(entry => {
          if (entry.title === "Part-time Job" || entry.title === "Part-timeJob") {
            return {
              ...entry,
              title: "バイト",
              content: "東京生活にも慣れてきた。バイトも順調。",
              summary: "東京生活にも慣れてきた。"
            };
          }
          if (entry.title === "Tokyo Life 3❤") {
            return {
              ...entry,
              title: "東京生活3❤",
              content: "お台場で奥寺先輩、司、高木とデート（？）をした！めちゃくちゃ楽しかった！",
              summary: "お台場で奥寺先輩、司、高木と。"
            };
          }
          if (entry.title === "Midterms Start") {
            return {
              ...entry,
              title: "中間テスト開始",
              content: "全然勉強してないのにテストが始まってしまった。どうしよう。",
              summary: "全然勉強してない..."
            };
          }
          if (entry.title === "Tokyo Life 2❤") {
            return {
              ...entry,
              title: "東京生活2❤",
              content: "初❤奥寺先輩と東京でディナー。ちょっと緊張したけど、先輩は優しかった！",
              summary: "初❤奥寺先輩と東京でディナー。"
            };
          }
          if (entry.content && entry.content.includes("When I woke up, I was in a strange room")) {
            return {
              ...entry,
              content: "朝起きたら、知らない部屋にいた。夢だと思ったけど...",
              summary: "朝起きたら、知らない部屋にいた。"
            };
          }
          return entry;
        });

        let migratedUserName = saved.userName;
        if (saved.userName === "Taki Tachibana") {
          migratedUserName = "立花 瀧";
        } else if (saved.userName === "Mitsuha Miyamizu") {
          migratedUserName = "宮水 三葉";
        }

        return {
          ...defaultData,
          ...saved,
          userName: migratedUserName,
          topics: mergedTopics,
          entries: migratedEntries.length > 0 ? migratedEntries : defaultData.entries,
          memos: saved.memos || defaultData.memos,
          contacts: saved.contacts || defaultData.contacts,
          version: initialData.version
        };
      }
      const isJa = navigator.language?.startsWith("ja");
      return isJa ? initialData : initialDataEn;
    } catch {
      const isJa = navigator.language?.startsWith("ja");
      return isJa ? initialData : initialDataEn;
    }
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const saved = await loadDiaryState() || await migrateLegacyState();
        if (!cancelled && saved) setData(saved);
      } catch (error) {
        console.error("Failed to open IndexedDB diary storage", error);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return undefined;
    const handler = setTimeout(() => {
      saveDiaryState(data).catch((error) => {
        console.error("Failed to save diary", error);
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [data, hydrated]);
  return [data, setData];
}



function App() {
  const [data, setData] = useDiaryData();
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [screen, setScreen] = useState("diary");
  const [prevScreen, setPrevScreen] = useState(null);
  const [transDir, setTransDir] = useState("forward"); // "forward" | "back"
  const [transitioning, setTransitioning] = useState(false);
  const screenRef = useRef(screen);
  const transitionTimerRef = useRef(null);

  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayTheme, setOverlayTheme] = useState("taki");

  // Save celebration: brief comet/sparkle burst after saving a diary
  const [showSaveCelebration, setShowSaveCelebration] = useState(false);
  const saveCelebrationTimerRef = useRef(null);

  const triggerSaveCelebration = useCallback(() => {
    window.clearTimeout(saveCelebrationTimerRef.current);
    setShowSaveCelebration(true);
    saveCelebrationTimerRef.current = window.setTimeout(() => {
      setShowSaveCelebration(false);
    }, 2800);
  }, []);

  const triggerOverlay = useCallback((themeName) => {
    setOverlayTheme(themeName || data.theme);
    setOverlayActive(true);

  }, [data.theme]);

  const handleBodySwap = useCallback(() => {
    const nextTheme = data.theme === "taki" ? "mitsuha" : "taki";
    triggerOverlay(nextTheme);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        theme: nextTheme,
        userName: THEMES[nextTheme].userName
      }));
    }, 600);
  }, [data.theme, triggerOverlay, setData]);

  const animatedSetScreen = useCallback((next, direction = "forward") => {
    const current = screenRef.current;
    if (next === current) return;
    window.clearTimeout(transitionTimerRef.current);
    setPrevScreen(current);
    setTransDir(direction);
    setTransitioning(true);
    screenRef.current = next;
    setScreen(next);
    transitionTimerRef.current = window.setTimeout(() => {
      setTransitioning(false);
      setPrevScreen(null);
    }, 320);
  }, []);

  const navigateTo = useCallback((next) => {
    if (next === screenRef.current) return;
    window.history.pushState({ [HISTORY_KEY]: true, screen: next }, "");
    animatedSetScreen(next, "forward");
  }, [animatedSetScreen]);

  const goBack = useCallback(() => {
    if (screenRef.current === "diary") return;
    
    let popstateFired = false;
    const onPopStateTemp = () => {
      popstateFired = true;
    };
    
    window.addEventListener("popstate", onPopStateTemp, { once: true });
    window.history.back();
    
    // Fallback: If no popstate fires (e.g. because browser stack is empty, 
    // Vite reloaded, or local file system restricts history navigation), 
    // transition manually.
    setTimeout(() => {
      window.removeEventListener("popstate", onPopStateTemp);
      if (!popstateFired && screenRef.current !== "home") {
        animatedSetScreen("home", "back");
      }
    }, 100);
  }, [animatedSetScreen]);

  useEffect(() => {
    const currentState = window.history.state;
    if (!currentState?.[HISTORY_KEY]) {
      window.history.replaceState({ ...currentState, [HISTORY_KEY]: true, screen: "diary" }, "");
    }

    const onPopState = (event) => {
      const next = event.state?.[HISTORY_KEY] ? event.state.screen : "home";
      animatedSetScreen(next || "home", "back");
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.clearTimeout(transitionTimerRef.current);
    };
  }, [animatedSetScreen]);

  // Swipe-from-left-edge to go back on mobile
  const goBackRef = useRef(null);
  goBackRef.current = screen !== "diary" ? goBack : null;
  useSwipeBack(goBackRef);
  const [topic, setTopic] = useState(() => data.topics.find(t => t.type === "diary") ?? null);
  const [diaryTab, setDiaryTab] = useState("entries");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Topic adding / editing mode states
  const [addingTopic, setAddingTopic] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Security Lock states
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [securityMode, setSecurityMode] = useState(null); // 'create' | 'remove' | null

  useEffect(() => {
    if (!data.locked || !appUnlocked) return undefined;
    const idleMinutes = data.security?.idleMinutes || 5;
    let idleTimer;
    let hiddenAt = null;
    const resetIdleTimer = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => setAppUnlocked(false), idleMinutes * 60 * 1000);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else {
        if (hiddenAt && Date.now() - hiddenAt > 30000) setAppUnlocked(false);
        hiddenAt = null;
        resetIdleTimer();
      }
    };
    const events = ["pointerdown", "keydown", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    resetIdleTimer();
    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [appUnlocked, data.locked, data.security?.idleMinutes]);

  // iOS-style dialog helper state and Promise functions
  const [iosAlert, setIosAlert] = useState(null);

  useEffect(() => {
    requestPersistentStorage().catch(() => false);
  }, []);

  const showAlert = useCallback((message, title = "") => {
    return new Promise((resolve) => {
      setIosAlert({ type: "alert", title, message, resolve });
    });
  }, []);

  const showConfirm = useCallback((message, title = "") => {
    return new Promise((resolve) => {
      setIosAlert({ type: "confirm", title, message, resolve });
    });
  }, []);

  const showPrompt = useCallback((message, defaultValue = "", title = "") => {
    return new Promise((resolve) => {
      setIosAlert({ type: "prompt", title, message, defaultValue, resolve });
    });
  }, []);

  const theme = THEMES[data.theme] || THEMES.taki;
  const getThemeColors = (tName) => {
    switch (tName) {
      case "mitsuha":
        return {
          light: "rgba(239, 114, 101, 0.45)",
          shadow: "rgba(239, 114, 101, 0.18)"
        };
      case "twilight":
        return {
          light: "rgba(124, 78, 181, 0.45)",
          shadow: "rgba(124, 78, 181, 0.18)"
        };
      default: // taki
        return {
          light: "rgba(103, 181, 230, 0.45)",
          shadow: "rgba(103, 181, 230, 0.18)"
        };
    }
  };
  const themeColors = getThemeColors(data.theme);

  const style = {
    "--theme": theme.main,
    "--theme-dark": theme.dark,
    "--theme-light": themeColors.light,
    "--theme-shadow": themeColors.shadow,
    "--theme-bg": `url(${theme.background})`,
    "--profile-bg": `url(${theme.profile})`,
    "--contacts-bg": `url(${theme.contacts})`,
  };

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme.main);
    }
  }, [theme]);

  const openTopic = (item) => {
    setTopic(item);
    navigateTo(item.type);
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
        <StatusBar locked={data.locked} activeScreen={screen} showingLock={showLockScreen} />
        {showLockScreen ? (
          <LockScreen
            t={t}
            mode="unlock"
            expectedPin={data.password}
            expectedSecurity={data.security}
            onComplete={() => {
              setAppUnlocked(true);
            }}
            onLegacyUnlock={async (pin) => {
              const security = await createPinSecurity(pin);
              setData((current) => ({ ...current, security, password: "" }));
            }}
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
                        showConfirm={showConfirm}
                        showPrompt={showPrompt}
                        onBodySwap={handleBodySwap}
                      />
                    );
                  case "diary":
                    return (
                      <Diary
                        data={data}
                        setData={setData}
                        title={topic?.title || "Diary"}
                        tab={diaryTab}
                        setTab={setDiaryTab}
                        selected={selectedEntry}
                        setSelected={setSelectedEntry}
                        goHome={() => { window.history.pushState({ [HISTORY_KEY]: true, screen: "home" }, ""); animatedSetScreen("home", "back"); }}
                        t={t}
                        currentLang={currentLang}
                        showConfirm={showConfirm}
                        showPrompt={showPrompt}
                        showAlert={showAlert}
                        triggerOverlay={triggerOverlay}
                        onSaved={triggerSaveCelebration}
                      />
                    );
                  case "memo":
                    return (
                      <Memo
                        data={data}
                        setData={setData}
                        topicId={topic?.id}
                        title={topic?.title || "禁止事項 Ver.5"}
                        goHome={goBack}
                        t={t}
                      />
                    );
                  case "contacts":
                    return (
                      <Contacts
                        data={data}
                        setData={setData}
                        title={topic?.title || "Contacts"}
                        goHome={goBack}
                        t={t}
                        showConfirm={showConfirm}
                      />
                    );
                  case "settings":
                    return (
                      <Settings
                        data={data}
                        setData={setData}
                        goHome={goBack}
                        openAbout={() => navigateTo("about")}
                        onToggleLock={() => {
                          if (data.locked) {
                            setSecurityMode("remove");
                          } else {
                            setSecurityMode("create");
                          }
                        }}
                        t={t}
                        showAlert={showAlert}
                        showPrompt={showPrompt}
                        triggerOverlay={triggerOverlay}
                      />
                    );
                  case "about":
                    return <About goHome={goBack} t={t} />;
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
                open={(next) => { navigateTo(next); setSettingsOpen(false); }}
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
                  createPinSecurity(newPin).then((security) => {
                    setData({ ...data, locked: true, security, password: "" });
                    setSecurityMode(null);
                    setAppUnlocked(true);
                  });
                }}
                onCancel={() => setSecurityMode(null)}
              />
            )}

            {securityMode === "remove" && (
              <LockScreen
                t={t}
                mode="remove"
                expectedPin={data.password}
                expectedSecurity={data.security}
                onComplete={() => {
                  setData({ ...data, locked: false, password: "", security: undefined });
                  setSecurityMode(null);
                }}
                onCancel={() => setSecurityMode(null)}
              />
            )}
          </>
        )}

        {iosAlert && (
          <IOSAlertDialog
            type={iosAlert.type}
            title={iosAlert.title}
            message={iosAlert.message}
            defaultValue={iosAlert.defaultValue}
            onResolve={(val) => {
              iosAlert.resolve(val);
              setIosAlert(null);
            }}
            t={t}
          />
        )}

        <HandwrittenOverlay
          theme={overlayTheme}
          active={overlayActive}
          onComplete={() => setOverlayActive(false)}
        />

        {/* Brief sparkle burst shown only after saving a diary entry */}
        {showSaveCelebration && (
          <div className="save-celebration-overlay" aria-hidden="true">
            <CometBackground active={true} burstMode={true} speed={1.4} />
          </div>
        )}

        {splashVisible && <SplashScreen leaving={splashLeaving} />}
      </div>
    </div>
  );
}

function SplashScreen({ leaving }) {
  return (
    <div className={`splash-screen ${leaving ? "leaving" : ""}`} aria-label="MyDiary is loading">
      <img src={`${A}iv_init_logo.png`} alt="MyDiary" style={{ zIndex: 1 }} />
      <img className="splash-loader" src={`${A}ic_photo_overview_loading.png`} alt="" aria-hidden="true" style={{ zIndex: 1 }} />
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

function StatusBar({ locked, activeScreen, showingLock }) {
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
    let active = true;
    navigator.getBattery?.().then((manager) => {
      if (!active) return;
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
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      network?.removeEventListener?.("change", updateConnection);
      if (batteryManager) {
        batteryManager.removeEventListener("levelchange", updateBattery);
        batteryManager.removeEventListener("chargingchange", updateBattery);
      }
    };
  }, []);

  const signalBars = connection === "slow-2g" ? 1 : connection === "2g" ? 2 : connection === "3g" ? 4 : 5;
  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const batteryPercent = Math.round(battery.level * 100);

  return (
    <div className={`status-bar screen-${activeScreen}${showingLock ? " screen-lock" : ""}`}>
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

function Home({ data, setData, openTopic, openSettings, editMode, setEditMode, getTopicCount, t, showConfirm, showPrompt, onBodySwap }) {
  const [query, setQuery] = useState("");
  const topics = data.topics.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleDeleteTopic = async (topic) => {
    if (await showConfirm(t("delete_topic_confirm", topic.title))) {
      setData({
        ...data,
        topics: data.topics.filter(t => t.id !== topic.id),
        memos: data.memos.filter(m => m.topicId !== topic.id)
      });
    }
  };

  const handleRenameTopic = async (topic) => {
    const newName = await showPrompt(t("rename_topic_prompt", topic.title), topic.title);
    if (newName && newName.trim()) {
      setData({
        ...data,
        topics: data.topics.map(t => t.id === topic.id ? { ...t, title: newName.trim() } : t)
      });
    }
  };

  return (
    <main className="screen home-screen">
      <div className="profile-header-container">
        <button className="profile-header" onClick={openSettings} aria-label={t("settings_btn")}>
          <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
          <span className="profile-name">{data.userName}</span>
        </button>
        <button className="body-swap-btn" onClick={onBodySwap} title={t("swap_body")}>
          <Icon name="ic_memo_swap_vert_black_24dp.png" className="swap-icon" />
          <span>{t("swap_body")}</span>
        </button>
      </div>
      <FlatList
        className="topic-list"
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TopicRow
            item={item}
            count={getTopicCount(item)}
            onClick={() => openTopic(item)}
            editMode={editMode}
            onDelete={handleDeleteTopic}
            onRename={handleRenameTopic}
            index={index}
            t={t}
          />
        )}
      />
      <div className="home-search-bar">
        <label className="native-search">
          <Icon name="ic_search_white_18dp.png" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={t("search_topics")} placeholder={t("search_topics")} />
        </label>
        <button onClick={() => setEditMode(!editMode)} aria-label={t("edit_topics")} style={{ marginRight: '5px' }}>
          <Icon name={editMode ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} style={{ filter: "invert(1)" }} />
        </button>
        <button onClick={openSettings} aria-label={t("settings_btn")}><Icon name="ic_settings_black_24dp.png" /></button>
      </div>
    </main>
  );
}

const TopicRow = React.memo(function TopicRow({ item, onClick, count, editMode, onDelete, onRename, index = 0, t }) {
  const icon = item.type === "diary" ? "ic_topic_diary.png" : item.type === "contacts" ? "ic_topic_contacts.png" : "ic_topic_memo.png";
  return (
    <div className="topic-row-wrapper anim-stagger-item" style={{ "--stagger-i": index }}>
      <button className="topic-row" onClick={editMode ? undefined : onClick} style={{ flex: 1 }}>
        <Icon name={icon} />
        <span>{getTranslatedTopicTitle(item.title, t)}</span>
        <small>{count}</small>
        {!editMode && <Icon name="ic_keyboard_arrow_right_black_24dp.png" />}
      </button>
      {editMode && (
        <div className="topic-edit-actions" style={{ display: 'flex', gap: '5px', paddingRight: '15px' }}>
          <button onClick={() => onRename(item)} aria-label="Rename topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_mode_edit_white_24dp.png" style={{ filter: 'invert(1)' }} />
          </button>
          <button onClick={() => onDelete(item)} aria-label="Delete topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_cancel_black_24dp.png" />
          </button>
        </div>
      )}
    </div>
  );
});

function Diary({ data, setData, title, tab, setTab, selected, setSelected, goHome, t, currentLang, showConfirm, showPrompt, showAlert, triggerOverlay, onSaved }) {
  const openEntry = (entry) => {
    setSelected(entry);
    setTab("editor");
    setPhotoOverviewOpen(false);
  };

  const [photoOverviewOpen, setPhotoOverviewOpen] = useState(false);
  const [selectedOverviewPhoto, setSelectedOverviewPhoto] = useState(null);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const visibleEntries = bookmarkedOnly ? data.entries.filter((entry) => entry.bookmarked) : data.entries;
  const toggleBookmark = useCallback((entryId) => {
    setData((current) => ({
      ...current,
      entries: current.entries.map((entry) => entry.id === entryId
        ? { ...entry, bookmarked: !entry.bookmarked }
        : entry),
    }));
  }, [setData]);

  return (
    <main className="screen diary-screen">
      <header className="diary-header">
        <div className="native-segmented">
          <button className={tab === "entries" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("entries"); setPhotoOverviewOpen(false); }}>{t("entries")}</button>
          <button className={tab === "calendar" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("calendar"); setPhotoOverviewOpen(false); }}>{t("calendar")}</button>
          <button className={tab === "editor" && !photoOverviewOpen ? "active" : ""} onClick={() => { setTab("editor"); setPhotoOverviewOpen(false); }}>{t("diary")}</button>
        </div>
        <div className="diary-topic-title">{photoOverviewOpen ? t("photo_overview") : getTranslatedTopicTitle(title, t)}</div>
      </header>
      
      {photoOverviewOpen ? (
        <PhotoOverview
          t={t}
          entries={data.entries}
          onSelectPhoto={(photo, entry) => setSelectedOverviewPhoto({ photo, entry })}
        />
      ) : (
        <div className="diary-content">
          {tab === "entries" && (
            visibleEntries.length === 0 && bookmarkedOnly ? (
              <div className="bookmark-empty" role="status">
                <svg className="bookmark-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h9A1.5 1.5 0 0 1 18 3.5V22l-6-4.15L6 22V3.5Z" />
                </svg>
                <p>{t("no_bookmarks")}</p>
                <button onClick={() => setBookmarkedOnly(false)}>{t("show_all_entries")}</button>
              </div>
            ) : (
              <EntryList entries={visibleEntries} openEntry={openEntry} toggleBookmark={toggleBookmark} t={t} currentLang={currentLang} />
            )
          )}
          {tab === "calendar" && <Calendar entries={data.entries} openEntry={openEntry} toggleBookmark={toggleBookmark} t={t} currentLang={currentLang} />}
          {tab === "editor" && <DiaryEditor entry={selected} data={data} setData={setData} close={() => setTab("entries")} t={t} currentLang={currentLang} showConfirm={showConfirm} showPrompt={showPrompt} showAlert={showAlert} triggerOverlay={triggerOverlay} onSaved={onSaved} />}
        </div>
      )}

      {tab !== "editor" && !photoOverviewOpen && (
        <BottomBar>
          <button onClick={goHome}><Icon name="ic_menu_white_24dp.png" /></button>
          <button onClick={() => { setSelected(null); setTab("editor"); }}><Icon name="ic_mode_edit_white_24dp.png" /></button>
          <button onClick={() => setPhotoOverviewOpen(true)}><Icon name={tab === "calendar" ? "ic_photo_camera_white_24dp.png" : "ic_photo_white_24dp.png"} /></button>
          {tab === "entries" && (
            <button
              className={`bookmark-filter ${bookmarkedOnly ? "active" : ""}`}
              onClick={() => setBookmarkedOnly((value) => !value)}
              aria-label="Show bookmarked entries"
              aria-pressed={bookmarkedOnly}
            >
              <svg className="bookmark-filter-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h9A1.5 1.5 0 0 1 18 3.5V22l-6-4.15L6 22V3.5Z" />
              </svg>
            </button>
          )}
          {tab === "entries" && <span className="entry-count">{t("entries_count", visibleEntries.length)}</span>}
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

const EntryCard = React.memo(function EntryCard({ entry, openEntry, toggleBookmark, t, currentLang, index }) {
  const rawDate = new Date(`${entry.date}T00:00:00`);
  const weekdayText = entry.weekday || rawDate.toLocaleDateString(currentLang, { weekday: "short" });
  return (
    <div className="entry-card anim-stagger-item" style={{ "--stagger-i": index }}>
      <button className="entry-card-main" onClick={() => openEntry(entry)}>
        <div className="entry-card-date">
          <b>{entry.day}</b>
          <span>{weekdayText}.</span>
        </div>
        <div className="entry-copy">
          <strong className="entry-card-title">{getTranslatedEntryField(entry.title, t) || t("no_title")}</strong>
          <span className="entry-card-summary">{getTranslatedEntryField(entry.summary ?? entry.content ?? entry.location ?? "", t)}</span>
        </div>
        <div className="entry-card-icons">
          <div className="entry-card-top-icons">
            <Icon name={`ic_weather_${entry.weather}.png`} className="entry-card-icon" />
            <Icon name={`ic_mood_${entry.mood}.png`} className="entry-card-icon" />
          </div>
          {entry.photos && entry.photos.length > 0 && (
            <Icon name="ic_attach.png" className="entry-card-attach-icon" />
          )}
        </div>
      </button>
      <button
        className={`bookmark-button ${entry.bookmarked ? "active" : ""}`}
        aria-label="Bookmark entry"
        aria-pressed={Boolean(entry.bookmarked)}
        onClick={() => toggleBookmark?.(entry.id)}
      >
        <Icon name="ic_bookmark_border.png" className="entry-card-icon bookmark-icon" />
      </button>
    </div>
  );
});

function EntryList({ entries, openEntry, toggleBookmark, t, currentLang }) {
  const grouped = entries.reduce((result, entry) => {
    const month = String(new Date(`${entry.date}T00:00:00`).getMonth() + 1);
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
          <FlatList
            data={monthEntries}
            keyExtractor={(entry) => entry.id}
            renderItem={({ item }) => {
              const i = ++flatIdx;
              return (
                <EntryCard
                  entry={item}
                  openEntry={openEntry}
                  toggleBookmark={toggleBookmark}
                  t={t}
                  currentLang={currentLang}
                  index={i}
                />
              );
            }}
          />
        </div>
      ))}
    </section>
  );
}

function Calendar({ entries, openEntry, toggleBookmark, t, currentLang }) {
  const [viewDate, setViewDate] = useState(() => {
    if (entries.length > 0) {
      return new Date(`${entries[0].date}T00:00:00`);
    }
    return new Date();
  });
  const [calendarMode, setCalendarMode] = useState("day");
  const [dragStart, setDragStart] = useState(null);
  const [dayTurn, setDayTurn] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevAction = () => {
    if (calendarMode === "day") {
      const previousDay = new Date(viewDate);
      previousDay.setDate(viewDate.getDate() - 1);
      setDayTurn({ id: Date.now(), direction: "prev", fromDate: new Date(viewDate) });
      setViewDate(previousDay);
    } else {
      setViewDate(new Date(year, month - 1, 1));
    }
  };

  const nextAction = () => {
    if (calendarMode === "day") {
      const followingDay = new Date(viewDate);
      followingDay.setDate(viewDate.getDate() + 1);
      setDayTurn({ id: Date.now(), direction: "next", fromDate: new Date(viewDate) });
      setViewDate(followingDay);
    } else {
      setViewDate(new Date(year, month + 1, 1));
    }
  };

  const formattedMonthName = viewDate.toLocaleDateString(currentLang, { month: "long" });
  const formattedWeekday = viewDate.toLocaleDateString(currentLang, { weekday: "long" });
  const selectedDatePattern = [
    year,
    String(month + 1).padStart(2, "0"),
    String(viewDate.getDate()).padStart(2, "0"),
  ].join("-");
  const selectedEntry = entries.find((item) => item.date === selectedDatePattern);
  const selectedDayEntries = entries.filter((item) => item.date === selectedDatePattern);
  const formatDay = (date) => ({
    month: date.toLocaleDateString(currentLang, { month: "long" }),
    date: date.getDate(),
    weekday: date.toLocaleDateString(currentLang, { weekday: "long" }),
  });
  const turnedFromDay = dayTurn ? formatDay(dayTurn.fromDate) : null;

  const weekdays = currentLang === "ja"
    ? ["月", "火", "水", "木", "金", "土", "日"]
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Helper to render the day cells
  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    const spacers = Array.from({ length: startDayOfWeek }, (_, index) => index);

    return (
      <>
        {spacers.map((val) => <i key={`spacer-${val}`} />)}
        {days.map((day) => {
          const monthStr = String(month + 1).padStart(2, "0");
          const dayStr = String(day).padStart(2, "0");
          const datePattern = `${year}-${monthStr}-${dayStr}`;
          const entry = entries.find((item) => item.date === datePattern);
          const dayDate = new Date(year, month, day);
          const isToday = new Date().toDateString() === dayDate.toDateString();
          const isSelected = viewDate.toDateString() === dayDate.toDateString();

          return (
            <button
              key={day}
              className={`${entry ? "marked" : ""} ${isToday ? "today-cell" : ""} ${isSelected ? "selected-cell" : ""}`}
              onClick={() => {
                setViewDate(dayDate);
              }}
            >
              {day}
              {entry && <span />}
            </button>
          );
        })}
      </>
    );
  };

  return (
    <section
      className={`calendar-view ${calendarMode === "day" ? "calendar-day-mode" : "calendar-month-mode"}`}
      onPointerDown={(event) => {
        if (calendarMode !== "day") return;
        setDragStart(event.clientX);
      }}
      onPointerUp={(event) => {
        if (dragStart === null) return;
        const distance = event.clientX - dragStart;
        if (Math.abs(distance) > 44) {
          if (distance > 0) prevAction();
          else nextAction();
        }
        setDragStart(null);
      }}
      onPointerCancel={() => setDragStart(null)}
    >
      {calendarMode === "day" ? (
        <div className="anime-day-sheet">
          <button className="day-page-hit day-page-prev" onClick={prevAction} aria-label="Previous day" />
          <button
            className="day-page-date"
            onClick={() => selectedEntry && openEntry(selectedEntry)}
            aria-label={selectedEntry ? t("view_diary_entry") : selectedDatePattern}
          >
            <span className="day-page-month">{formattedMonthName}</span>
            <strong>{viewDate.getDate()}</strong>
            <span className="day-page-weekday">{formattedWeekday}</span>
            {selectedEntry && <i className="day-page-entry-dot" />}
          </button>
          <button className="day-page-hit day-page-next" onClick={nextAction} aria-label="Next day" />
          {turnedFromDay && (
            <div
              key={dayTurn.id}
              className={`page-flip-layer page-flip-${dayTurn.direction}`}
              onAnimationEnd={() => {
                setDayTurn(null);
              }}
              aria-hidden="true"
            >
              <div className="day-page-date page-flip-copy">
                <span className="day-page-month">{turnedFromDay.month}</span>
                <strong>{turnedFromDay.date}</strong>
                <span className="day-page-weekday">{turnedFromDay.weekday}</span>
              </div>
              <div className="page-fold-wrapper">
                <i className="page-fold-back" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="month-calendar">
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
        </div>
      )}
      <div className="calendar-entries-container">
        {selectedDayEntries.length > 0 ? (
          <FlatList
            data={selectedDayEntries}
            keyExtractor={(entry) => entry.id}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                openEntry={openEntry}
                toggleBookmark={toggleBookmark}
                t={t}
                currentLang={currentLang}
                index={0}
              />
            )}
          />
        ) : (
          <div className="calendar-no-entries">
            <span>{currentLang === "ja" ? "この日のエントリーはありません" : "No entries on this day"}</span>
          </div>
        )}
      </div>
      <button 
        className={`calendar-mode ${calendarMode === "month" ? "month-mode" : "day-mode"}`}
        onClick={() => setCalendarMode(calendarMode === "month" ? "day" : "month")}
        aria-label="Toggle calendar mode"
      >
        <Icon name="ic_keyboard_arrow_down_black_24dp.png" />
      </button>
    </section>
  );
}

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
        background: "transparent",
        minHeight: "28px"
      }}
    />
  );
};

function DiaryEditor({ entry, data, setData, close, t, currentLang, showConfirm, showPrompt, showAlert, triggerOverlay, onSaved }) {
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

  useEffect(() => {
    if (!draftReady) return undefined;
    const hasContent = (draft.title || "").trim()
      || items.some((item) => item.type === "photo" || (item.type === "text" && item.value.trim()));
    const handler = window.setTimeout(() => {
      const action = hasContent
        ? saveDiaryDraft(draftKey, { draft, items })
        : deleteDiaryDraft(draftKey);
      action.catch((error) => console.error("Failed to save diary draft", error));
    }, 700);
    return () => window.clearTimeout(handler);
  }, [draft, draftKey, draftReady, items]);

  useEffect(() => {
    if (!draftReady) return undefined;
    const persistOnHide = () => {
      if (document.visibilityState !== "hidden") return;
      const currentDraft = draftRef.current;
      const currentItems = itemsRef.current;
      const hasContent = (currentDraft.title || "").trim()
        || currentItems.some((item) => item.type === "photo" || (item.type === "text" && item.value.trim()));
      if (hasContent) {
        saveDiaryDraft(draftKey, { draft: currentDraft, items: currentItems }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", persistOnHide);
    return () => document.removeEventListener("visibilitychange", persistOnHide);
  }, [draftKey, draftReady]);

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
          <label><Icon name={`ic_weather_${draft.weather}.png`} /><select value={draft.weather} onChange={(event) => update("weather", event.target.value)}>{["sunny", "cloud", "windy", "rainy", "snowy", "foggy"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><Icon name={`ic_mood_${draft.mood}.png`} /><select value={draft.mood} onChange={(event) => update("mood", event.target.value)}>{["happy", "soso", "unhappy"].map((item) => <option key={item}>{item}</option>)}</select></label>
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
      <NativeTitle title={getTranslatedTopicTitle(title, t)} goHome={goHome}>
        <button onClick={() => setEditing(!editing)}><Icon name={editing ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} /></button>
      </NativeTitle>
      {editing && <div className="memo-add"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} placeholder={t("add")} /><button onClick={add}><Icon name="ic_add_white_24dp.png" /></button></div>}
      <FlatList
        className="memo-list"
        data={topicMemos}
        keyExtractor={(memo) => memo.id}
        renderItem={({ item, index }) => (
          <label className={`${item.checked ? "checked" : ""} anim-stagger-item`} style={{ "--stagger-i": index }}>
            <Icon name="ic_memo_dot_24dp.png" />
            <input type="checkbox" checked={item.checked} onChange={() => setData({ ...data, memos: data.memos.map((m) => m.id === item.id ? { ...m, checked: !m.checked } : m) })} />
            <span>{getTranslatedMemoText(item.text, t)}</span>
            {editing && <button onClick={() => setData({ ...data, memos: data.memos.filter((m) => m.id !== item.id) })}><Icon name="ic_cancel_black_24dp.png" /></button>}
          </label>
        )}
      />
    </main>
  );
}

function Contacts({ data, setData, title, goHome, t, showConfirm }) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [callingContact, setCallingContact] = useState(null);
  const [draft, setDraft] = useState({ name: "", phone: "" });
  
  const filtered = data.contacts.filter((item) => `${item.name}${item.phone}`.toLowerCase().includes(query.toLowerCase()));
  
  const save = () => {
    if (!draft.name.trim()) return;
    setData({ ...data, contacts: [...data.contacts, { ...draft, id: Date.now() }] });
    setDraft({ name: "", phone: "" });
    setAdding(false);
  };

  const deleteContact = async (contactId) => {
    if (await showConfirm(t("delete_contact_confirm"))) {
      setData({ ...data, contacts: data.contacts.filter(c => c.id !== contactId) });
    }
  };

  return (
    <main className="screen contacts-screen">
      <header className="contacts-header">
        <button className="contacts-back" onClick={goHome} aria-label="Back">‹</button>
        <span className="contacts-title">{getTranslatedTopicTitle(title, t)}</span>
        <button className="contacts-add" onClick={() => setAdding(true)} aria-label={t("add_contact")}>
          <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <label className="native-search"><Icon name="ic_search_white_18dp.png" /><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </header>
      <div className="letters">A<br />B<br />C<br />D<br />E<br />F<br />G<br />H<br />I<br />J<br />K<br />L<br />M<br />N<br />O<br />P<br />Q<br />R<br />S<br />T<br />U<br />V<br />W<br />X<br />Y<br />Z</div>
      <FlatList
        className="contact-list"
        data={filtered}
        keyExtractor={(contact) => contact.id}
        renderItem={({ item, index }) => (
          <div className="anim-stagger-item" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cacaca', "--stagger-i": index }}>
            <button className="contact-call-target" onClick={() => setCallingContact(item)}>
              <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
              <span><b>{item.name}</b><small>{item.phone}</small></span>
            </button>
            <button onClick={() => deleteContact(item.id)} style={{ background: 'transparent', padding: '10px' }} aria-label={t("delete_contact_confirm")}>
              <Icon name="ic_cancel_black_24dp.png" />
            </button>
          </div>
        )}
      />
      {adding && (
        <NativeDialog title={t("contact_dialog_title")} close={() => setAdding(false)}>
          <div className="ios-form-fields">
            <input placeholder={t("name")} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} autoFocus />
            <input placeholder={t("phone")} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} inputMode="tel" />
          </div>
          <div className="ios-form-actions">
            <button className="ios-form-cancel" onClick={() => setAdding(false)}>{t("cancel")}</button>
            <button className="ios-form-ok" onClick={save}>{t("ok")}</button>
          </div>
        </NativeDialog>
      )}
      {callingContact && (
        <FakeCallScreen
          contact={callingContact}
          close={() => setCallingContact(null)}
          t={t}
        />
      )}
    </main>
  );
}

function parseVttTime(value) {
  const parts = value.trim().split(":").map(Number);
  const seconds = parts.pop() ?? 0;
  const minutes = parts.pop() ?? 0;
  const hours = parts.pop() ?? 0;
  return (hours * 3600) + (minutes * 60) + seconds;
}

function parseVtt(text) {
  return text
    .replace(/\r/g, "")
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      const timingIndex = lines.findIndex((line) => line.includes("-->"));
      if (timingIndex === -1) return null;

      const [start, end] = lines[timingIndex].split("-->").map((value) => value.trim().split(/\s+/)[0]);
      const textLines = lines.slice(timingIndex + 1);
      return {
        start: parseVttTime(start),
        end: parseVttTime(end),
        text: textLines.join("\n")
      };
    })
    .filter(Boolean);
}

function playEndCallBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playBeep = (startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    };
    
    playBeep(ctx.currentTime);
    playBeep(ctx.currentTime + 0.2);
  } catch (e) {
    console.error("Failed to play end call beep", e);
  }
}

function FakeCallScreen({ contact, close, t }) {
  const [phase, setPhase] = useState("calling");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [activeCaption, setActiveCaption] = useState([]);
  const connectTimerRef = useRef(null);
  const endCallTimerRef = useRef(null);
  const audioRef = useRef(null);

  const isMitsuha = /三葉|mitsuha/i.test(contact.name);
  const audioSource = isMitsuha
    ? `${import.meta.env.BASE_URL}assets/audio/mitsuha-call.mp3`
    : null;
  const subtitleSource = isMitsuha
    ? `${import.meta.env.BASE_URL}assets/audio/taki-and-mitsuha-meet-jpn.vtt`
    : null;

  const updateActiveCaption = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || subtitleCues.length === 0) return;

    const currentCue = subtitleCues.find((cue) => audio.currentTime >= cue.start && audio.currentTime <= cue.end);
    setActiveCaption(currentCue ? currentCue.text.split("\n") : []);
  }, [subtitleCues]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSource) {
      setVoiceAvailable(false);
      return;
    }

    audio.currentTime = 0;
    setActiveCaption([]);
    audio.play()
      .then(() => setVoiceAvailable(true))
      .catch(() => setVoiceAvailable(false));
  }, [audioSource]);

  useEffect(() => {
    if (!subtitleSource) {
      setSubtitleCues([]);
      setActiveCaption([`もしもし、${contact.name}です。声、聞こえる？`]);
      return undefined;
    }

    const controller = new AbortController();
    fetch(subtitleSource, { signal: controller.signal })
      .then((response) => response.ok ? response.text() : Promise.reject(new Error("Subtitle unavailable")))
      .then((text) => setSubtitleCues(parseVtt(text)))
      .catch((error) => {
        if (error.name !== "AbortError") setSubtitleCues([]);
      });

    return () => controller.abort();
  }, [contact.name, subtitleSource]);

  useEffect(() => {
    connectTimerRef.current = window.setTimeout(() => {
      setPhase("connected");
    }, 1400);
    return () => window.clearTimeout(connectTimerRef.current);
  }, []);

  useEffect(() => {
    if (phase !== "connected") return undefined;
    playAudio();
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase, playAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      audioRef.current.volume = speaker ? 1 : 0.62;
    }
  }, [muted, speaker]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (endCallTimerRef.current) {
        window.clearTimeout(endCallTimerRef.current);
      }
    };
  }, []);

  const endCall = useCallback(() => {
    setPhase((prevPhase) => {
      if (prevPhase === "ended") return prevPhase;
      
      window.clearTimeout(connectTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      playEndCallBeep();
      
      endCallTimerRef.current = window.setTimeout(() => {
        close();
      }, 1500);
      
      return "ended";
    });
  }, [close]);

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="fake-call-screen" aria-label={t("simulated_call")}>
      {audioSource && (
        <audio
          ref={audioRef}
          src={audioSource}
          preload="auto"
          onCanPlay={() => setVoiceAvailable(true)}
          onError={() => setVoiceAvailable(false)}
          onEnded={endCall}
          onSeeked={updateActiveCaption}
          onTimeUpdate={updateActiveCaption}
        />
      )}
      <div className="call-sky" />
      <div className="call-vignette" />
      {/* Comet removed from call screen – sky + vignette provide atmosphere */}
      <header className="call-simulation-label">{t("simulated_call")}</header>
      <div className="call-contact">
        <span className="call-avatar"><Icon name="ic_person_picture_default.png" /></span>
        <h2>{contact.name}</h2>
        <p>{phase === "calling" ? t("calling") : phase === "ended" ? t("call_ended") : `${t("connected")} · ${duration}`}</p>
      </div>
      {phase === "connected" && (
        <div className="call-dialogue" aria-live="polite">
          {activeCaption.map((line, index) => (
            <p className="call-caption-line" key={`${line}-${index}`}>
              <span>{line}</span>
            </p>
          ))}
          {!voiceAvailable && <small>{t("voice_unavailable")}</small>}
        </div>
      )}
      <div className="call-controls">
        <button className={muted ? "active" : ""} onClick={() => setMuted((value) => !value)} aria-pressed={muted} disabled={phase === "ended"}>
          <CallMicrophoneIcon muted={muted} />
          <span>{t("mute")}</span>
        </button>
        <button className={speaker ? "active" : ""} onClick={() => setSpeaker((value) => !value)} aria-pressed={speaker} disabled={phase === "ended"}>
          <CallSpeakerIcon />
          <span>{t("speaker")}</span>
        </button>
        <button onClick={playAudio} disabled={phase !== "connected" || phase === "ended"}>
          <CallReplayIcon />
          <span>{t("replay_voice")}</span>
        </button>
      </div>
      <button className="call-end" onClick={endCall} aria-label={t("end_call")} disabled={phase === "ended"} style={phase === "ended" ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
        <CallPhoneIcon />
      </button>
    </section>
  );
}

function CallMicrophoneIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6.5 11.5A5.5 5.5 0 0 0 17.5 11.5M12 17v4M9 21h6" />
      {muted && <path d="M5 5l14 14" />}
    </svg>
  );
}

function CallSpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10v4h4l5 4V6L9 10H5zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function CallReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function CallPhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'currentColor', stroke: 'none' }}>
      <path d="M12 9c-2.33 0-4.51.52-6.46 1.45-.6.28-.97.86-.97 1.52 0 .88.72 1.6 1.6 1.6.49 0 .93-.22 1.22-.57L9.3 11c.77-.32 1.63-.5 2.7-.5s1.93.18 2.7.5l1.91 1.91c.29.35.73.57 1.22.57.88 0 1.6-.72 1.6-1.6 0-.66-.37-1.24-.97-1.52C16.51 9.52 14.33 9 12 9z" />
    </svg>
  );
}

function NativeTitle({ title, goHome, children }) {
  return <header className="native-title"><button className="screen-back" onClick={goHome}>‹</button><span>{title}</span>{children}</header>;
}

function BottomBar({ children }) {
  return <footer className="bottom-bar">{children}</footer>;
}

function QuickSettings({ data, setData, close, open, onAddTopic, onToggleLock, t }) {
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

function AddTopicDialog({ close, save, t }) {
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

function Settings({ data, setData, goHome, openAbout, onToggleLock, t, showAlert, showPrompt, triggerOverlay }) {
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

function currentLanguage(data) {
  return data.language === "ja" || (data.language !== "en" && navigator.language?.startsWith("ja")) ? "ja" : "en";
}

function About({ goHome, t }) {
  return (
    <main className="screen about-screen">
      <NativeTitle title={t("about")} goHome={goHome} />
      <div className="about-content">
        <img className="about-logo" src={import.meta.env.BASE_URL + "assets/ic_launcher-web.png"} alt="MyDiary" />
        <h2>MyDiary</h2><p>Responsive web port of the original Android application.</p>
        <a href="https://github.com/DaxiaK/MyDiary" target="_blank" rel="noreferrer">{t("original_github")}</a>
        <h3>{t("original_screenshots")}</h3>
        <div className="screen-gallery">{Array.from({ length: 7 }, (_, index) => <img key={index} src={`${import.meta.env.BASE_URL}assets/screenshots/s_${index}.png`} alt="" />)}</div>
        <h3>{t("original_assets", assetNames.length)}</h3>
        <div className="asset-gallery">{assetNames.map((name) => <img key={name} src={`${A}${name}`} title={name} alt="" />)}</div>
      </div>
    </main>
  );
}

function NativeDialog({ title, close, children }) {
  return (
    <div
      className="dialog-scrim ios-form-scrim"
      onMouseDown={close}
      onKeyDown={(event) => event.key === "Escape" && close()}
      role="presentation"
    >
      <section
        className="native-dialog ios-form-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ios-form-content">
          <h3>{title}</h3>
          {children}
        </div>
      </section>
    </div>
  );
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

function LockScreen({ mode, expectedPin, expectedSecurity, onComplete, onLegacyUnlock, onCancel, t }) {
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

  const handleKeyPress = useCallback((num) => {
    if (pin.length >= 4) return;
    setErrorMsg("");
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(async () => {
        if (mode === "unlock") {
          const valid = expectedSecurity
            ? await verifyPin(nextPin, expectedSecurity)
            : nextPin === expectedPin;
          if (valid) {
            if (!expectedSecurity && expectedPin && onLegacyUnlock) await onLegacyUnlock(nextPin);
            onComplete(nextPin);
          } else {
            setErrorMsg(t("wrong_passcode"));
            setPin("");
            triggerShake();
          }
        } else if (mode === "remove") {
          const valid = expectedSecurity
            ? await verifyPin(nextPin, expectedSecurity)
            : nextPin === expectedPin;
          if (valid) {
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
  }, [pin, expectedPin, expectedSecurity, mode, onComplete, onLegacyUnlock, tempPin, t]);

  const handleBackspace = useCallback(() => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg("");
    }
  }, [pin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(parseInt(e.key, 10));
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleBackspace, onCancel]);

  return (
    <div className="lock-screen">
      {/* Comet removed from lock screen – shown only after saving a diary */}
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

function IOSAlertDialog({ type, title, message, defaultValue = "", onResolve, t }) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (type === "prompt" && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const handleCancel = () => {
    if (type === "alert") {
      onResolve(true);
    } else {
      onResolve(null);
    }
  };

  const handleConfirm = () => {
    if (type === "prompt") {
      onResolve(inputValue);
    } else {
      onResolve(true);
    }
  };

  const isDestructive = message && (
    message.includes("delete") || 
    message.includes("discard") ||
    message.includes("削除") || 
    message.includes("破記") ||
    message.includes("破棄")
  );

  return (
    <div className="ios-alert-scrim" onClick={(e) => e.stopPropagation()}>
      <div className="ios-alert-dialog">
        <div className="ios-alert-content">
          {title && <h3 className="ios-alert-title">{title}</h3>}
          {message && <p className="ios-alert-message">{message}</p>}
          {type === "prompt" && (
            <input
              ref={inputRef}
              className="ios-alert-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              aria-label="Input field"
            />
          )}
        </div>
        <div className="ios-alert-buttons">
          {type !== "alert" && (
            <button className="ios-alert-btn ios-alert-btn-cancel" onClick={handleCancel}>
              {t("cancel")}
            </button>
          )}
          <button 
            className={`ios-alert-btn ios-alert-btn-ok ${isDestructive ? "destructive" : ""}`} 
            onClick={handleConfirm}
          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSPickerWheel({ options, value, onChange }) {
  const containerRef = useRef(null);
  const itemHeight = 36; // px
  const isUserScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);
  const lastValueRef = useRef(value);

  // Only sync scroll to value when value changes externally (not from scroll)
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.indexOf(value);
    if (idx === -1) return;
    // If value changed externally (not via user scroll), snap position
    if (!isUserScrollingRef.current && lastValueRef.current !== value) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
    lastValueRef.current = value;
  }, [value, options, itemHeight]);

  // On mount, always snap to correct position
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.indexOf(value);
    if (idx !== -1) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    isUserScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const idx = Math.round(scrollTop / itemHeight);
      const clampedIdx = Math.max(0, Math.min(idx, options.length - 1));
      // Snap to nearest item
      containerRef.current.scrollTop = clampedIdx * itemHeight;
      const selectedValue = options[clampedIdx];
      if (selectedValue !== lastValueRef.current) {
        lastValueRef.current = selectedValue;
        onChange(selectedValue);
      }
    }, 80);
  };

  return (
    <div className="ios-picker-wheel-wrapper">
      <div
        className="ios-picker-wheel"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="ios-picker-wheel-spacer" />
        {options.map((opt, index) => (
          <div
            key={`${opt}-${index}`}
            className={`ios-picker-wheel-item ${opt === value ? "selected" : ""}`}
            onClick={() => {
              if (containerRef.current) {
                isUserScrollingRef.current = false;
                containerRef.current.scrollTo({
                  top: index * itemHeight,
                  behavior: "smooth",
                });
                setTimeout(() => onChange(opt), 200);
              }
            }}
          >
            {opt}
          </div>
        ))}
        <div className="ios-picker-wheel-spacer" />
      </div>
    </div>
  );
}

function IOSDatePickerSheet({ value, onClose, onSave, t, currentLang }) {
  const years = Array.from({ length: 26 }, (_, i) => String(2010 + i));
  // iOS 7 style: full month names
  const months = currentLang === "ja"
    ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    : ["January", "February", "March", "April", "May", "June",
       "July", "August", "September", "October", "November", "December"];

  const initialDate = new Date(`${value}T00:00:00`);
  const [selectedYear, setSelectedYear] = useState(String(initialDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(months[initialDate.getMonth()]);

  const monthIdx = months.indexOf(selectedMonth);
  const daysInMonth = new Date(parseInt(selectedYear, 10), monthIdx + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // Safe day state initialization
  const initialDayVal = String(initialDate.getDate());
  const [selectedDay, setSelectedDay] = useState(initialDayVal);

  // Clamping days when month length changes
  useEffect(() => {
    const dayInt = parseInt(selectedDay, 10);
    if (dayInt > daysInMonth) {
      setSelectedDay(String(daysInMonth));
    }
  }, [selectedYear, selectedMonth, daysInMonth, selectedDay]);

  const handleDone = () => {
    const yearStr = selectedYear;
    const monthIndex = months.indexOf(selectedMonth);
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(Math.min(parseInt(selectedDay, 10), daysInMonth)).padStart(2, "0");
    onSave(`${yearStr}-${monthStr}-${dayStr}`);
  };

  return (
    <div className="ios-picker-scrim" onClick={onClose}>
      <div className="ios-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ios-picker-header">
          <button className="ios-picker-cancel-btn" onClick={onClose}>{t("cancel")}</button>
          <span className="ios-picker-title">{currentLang === "ja" ? "日付の選択" : "Select Date"}</span>
          <button className="ios-picker-done-btn" onClick={handleDone}>{t("ok")}</button>
        </div>
        <div className="ios-picker-wheels-container">
          <div className="ios-picker-selection-indicator" />
          <IOSPickerWheel options={months} value={selectedMonth} onChange={setSelectedMonth} />
          <IOSPickerWheel options={days} value={selectedDay} onChange={setSelectedDay} />
          <IOSPickerWheel options={years} value={selectedYear} onChange={setSelectedYear} />
        </div>
      </div>
    </div>
  );
}

function IOSTimePickerSheet({ value, onClose, onSave, t, currentLang }) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  // Parse initial value (value is "HH:MM", e.g. "08:23" or "20:23")
  const [initialH24, initialM] = value.split(":").map(Number);
  const initialPeriod = initialH24 >= 12 ? "PM" : "AM";
  let initialH12 = initialH24 % 12;
  if (initialH12 === 0) initialH12 = 12;

  const [selectedHour, setSelectedHour] = useState(String(initialH12).padStart(2, "0"));
  const [selectedMinute, setSelectedMinute] = useState(String(initialM).padStart(2, "0"));
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  const handleDone = () => {
    let h12 = parseInt(selectedHour, 10);
    const m = selectedMinute;
    const period = selectedPeriod;

    let h24 = h12;
    if (period === "PM" && h12 !== 12) {
      h24 += 12;
    } else if (period === "AM" && h12 === 12) {
      h24 = 0;
    }

    const h24Str = String(h24).padStart(2, "0");
    onSave(`${h24Str}:${m}`);
  };

  return (
    <div className="ios-picker-scrim" onClick={onClose}>
      <div className="ios-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ios-picker-header">
          <button className="ios-picker-cancel-btn" onClick={onClose}>{t("cancel")}</button>
          <span className="ios-picker-title">{currentLang === "ja" ? "時刻の選択" : "Select Time"}</span>
          <button className="ios-picker-done-btn" onClick={handleDone}>{t("ok")}</button>
        </div>
        <div className="ios-picker-wheels-container">
          <div className="ios-picker-selection-indicator" />
          <IOSPickerWheel options={hours} value={selectedHour} onChange={setSelectedHour} />
          <IOSPickerWheel options={minutes} value={selectedMinute} onChange={setSelectedMinute} />
          <IOSPickerWheel options={periods} value={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>
    </div>
  );
}

export default App;
