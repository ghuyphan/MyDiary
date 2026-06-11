import { useEffect } from "react";

export function useSwipeBack(callbackRef) {
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
