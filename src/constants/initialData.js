export const initialData = {
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

export const initialDataEn = {
  version: 6,
  theme: "taki",
  userName: "立花 瀧",
  locked: false,
  topics: initialData.topics,
  entries: initialData.entries,
  memos: initialData.memos,
  contacts: initialData.contacts,
};

export const defaultTopicTranslationKeys = {
  "緊急時以外かけちゃダメ！": "topic_contacts",
  "DIARY": "topic_diary",
  "Diary": "topic_diary",
  "禁止事項 Ver.5": "topic_rules",
  "ゼッタイ禁止": "topic_absolute",
  "DON'T CALL UNLESS EMERGENCY!": "topic_contacts",
  "Forbidden Ver.5": "topic_rules",
  "ABSOLUTELY FORBIDDEN": "topic_absolute"
};

export const getTranslatedTopicTitle = (title, t) => {
  const key = defaultTopicTranslationKeys[title];
  return key ? t(key) : title;
};

export const defaultMemoTranslationKeys = {
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

export const getTranslatedMemoText = (text, t) => {
  return text;
};

export const defaultEntryTranslationKeys = {
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

export const getTranslatedEntryField = (val, t) => {
  return val;
};
