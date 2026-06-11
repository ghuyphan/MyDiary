import { A } from "./assets";

export const THEMES = {
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

export const getThemeColors = (tName) => {
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
