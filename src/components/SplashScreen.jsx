import React from "react";
import { A } from "../constants/assets";

export default function SplashScreen({ leaving }) {
  return (
    <div className={`splash-screen ${leaving ? "leaving" : ""}`} aria-label="MyDiary is loading">
      <img src={`${A}iv_init_logo.png`} alt="MyDiary" style={{ zIndex: 1 }} />
      <img className="splash-loader" src={`${A}ic_photo_overview_loading.png`} alt="" aria-hidden="true" style={{ zIndex: 1 }} />
    </div>
  );
}
