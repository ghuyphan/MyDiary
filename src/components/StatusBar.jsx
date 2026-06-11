import React, { useState, useEffect } from "react";

export default function StatusBar({ locked, activeScreen, showingLock }) {
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
