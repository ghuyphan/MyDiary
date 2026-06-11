import React, { useEffect, useRef, useState } from "react";
import CometBackground from "./CometBackground";

const PHRASES = {
  taki: [
    { jp: "お前は誰だ？", en: "Who are you?" },
    { jp: "大事な人。忘れたくない人。", en: "Someone precious. Someone I don't want to forget." }
  ],
  mitsuha: [
    { jp: "すきだ", en: "I love you" },
    { jp: "あいつ、また勝手に私の体を...", en: "Him, again using my body..." }
  ],
  twilight: [
    { jp: "君の名は。", en: "Your Name." },
    { jp: "忘れてはいけない人。忘れたくなかった人。", en: "Someone I must never forget. Someone I didn't want to forget." }
  ]
};

export default function HandwrittenOverlay({ theme = "taki", active = false, onComplete }) {
  const [visible, setVisible] = useState(false);
  const [phrase, setPhrase] = useState({ jp: "", en: "" });
  const [renderedChars, setRenderedChars] = useState([]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    // Select a random phrase for the active theme
    const list = PHRASES[theme] || PHRASES.twilight;
    const selected = list[Math.floor(Math.random() * list.length)];
    setPhrase(selected);
    setVisible(true);
    setRenderedChars([]);

    // Stagger character drawing
    const chars = selected.jp.split("");
    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < chars.length) {
        setRenderedChars((prev) => [...prev, chars[charIdx]]);
        charIdx++;
      } else {
        clearInterval(interval);
        // Completed drawing, wait a moment then trigger onComplete transition
        setTimeout(() => {
          setVisible(false);
          // Allow fade-out animation to complete (400ms) before onComplete
          setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
          }, 400);
        }, 1500);
      }
    }, 120);

    return () => {
      clearInterval(interval);
    };
  }, [active, theme]);

  if (!active || !visible) return null;

  return (
    <div className={`handwritten-transition-overlay ${visible ? "fade-in" : "fade-out"}`}>
      {/* Comet particle effects in the background overlay */}
      <div className="handwritten-overlay-sky">
        <CometBackground active={active} speed={1.5} cometFrequency={2000} />
      </div>

      <div className="handwritten-overlay-content">
        <div className="handwritten-text-ja">
          {renderedChars.map((char, index) => {
            // Apply slight random rotation and size variation to look hand-written
            const randomRotation = (index % 3 === 0 ? 3 : index % 3 === 1 ? -3 : 0) + (Math.sin(index) * 2);
            const randomScale = 0.95 + (Math.cos(index) * 0.05);
            return (
              <span
                key={index}
                className="handwritten-char"
                style={{
                  transform: `scale(${randomScale}) rotate(${randomRotation}deg)`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
        
        {renderedChars.length === phrase.jp.length && (
          <div className="handwritten-text-en">
            {phrase.en}
          </div>
        )}
      </div>
    </div>
  );
}
