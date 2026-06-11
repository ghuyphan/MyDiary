import React, { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";

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

export default function FakeCallScreen({ contact, close, t }) {
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
        <button className="disabled-btn" disabled={true}>
          <CallKeypadIcon />
          <span>{t("keypad")}</span>
        </button>
        <button className={speaker ? "active" : ""} onClick={() => setSpeaker((value) => !value)} aria-pressed={speaker} disabled={phase === "ended"}>
          <CallSpeakerIcon />
          <span>{t("speaker")}</span>
        </button>
        <button className="disabled-btn" disabled={true}>
          <CallAddCallIcon />
          <span>{t("add_call")}</span>
        </button>
        <button className="disabled-btn" disabled={true}>
          <CallFaceTimeIcon />
          <span>{t("facetime")}</span>
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

function CallKeypadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
    </svg>
  );
}

function CallAddCallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CallFaceTimeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 10v-3a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 3 7v10a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-3l5 3.5v-11z" />
    </svg>
  );
}
