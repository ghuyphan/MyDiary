import React, { useCallback, useEffect, useRef, useState } from "react";
import CometBackground from "./CometBackground";
import HandwrittenOverlay from "./HandwrittenOverlay";
import { requestPersistentStorage } from "./storage/diaryStore";
import { createPinSecurity } from "./security/pin";
import { useDiaryData } from "./hooks/useDiaryData";
import { useSwipeBack } from "./hooks/useSwipeBack";
import StatusBar from "./components/StatusBar";
import LockScreen from "./components/LockScreen";
import Home from "./components/Home";
import Diary from "./components/Diary";
import Memo from "./components/Memo";
import Contacts from "./components/Contacts";
import Settings from "./components/Settings";
import About from "./components/About";
import QuickSettings from "./components/QuickSettings";
import AddTopicDialog from "./components/AddTopicDialog";
import IOSAlertDialog from "./components/IOSAlertDialog";
import SplashScreen from "./components/SplashScreen";
import { THEMES, getThemeColors } from "./constants/themes";
import { TRANSLATIONS } from "./constants/translations";

const HISTORY_KEY = "mydiary-screen";

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
    
    // Fallback
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
                  return transDir === "forward" ? "screen-enter-forward" : "screen-enter-back";
                }
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

export default App;
