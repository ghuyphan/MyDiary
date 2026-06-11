import { useState, useEffect } from "react";
import {
  loadDiaryState,
  migrateLegacyState,
  saveDiaryState,
} from "../storage/diaryStore";
import { initialData, initialDataEn } from "../constants/initialData";

export function useDiaryData() {
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
