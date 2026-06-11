import React from "react";
import NativeTitle from "./NativeTitle";
import { A, assetNames } from "../constants/assets";

export default function About({ goHome, t }) {
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
