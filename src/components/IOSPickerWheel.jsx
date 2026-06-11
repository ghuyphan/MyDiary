import React, { useEffect, useRef } from "react";

export default function IOSPickerWheel({ options, value, onChange }) {
  const containerRef = useRef(null);
  const itemHeight = 36; // px
  const isUserScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);
  const lastValueRef = useRef(value);

  // Only sync scroll to value when value changes externally (not from scroll)
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.indexOf(value);
    if (idx === -1) return;
    // If value changed externally (not via user scroll), snap position
    if (!isUserScrollingRef.current && lastValueRef.current !== value) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
    lastValueRef.current = value;
  }, [value, options, itemHeight]);

  // On mount, always snap to correct position
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.indexOf(value);
    if (idx !== -1) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    isUserScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const idx = Math.round(scrollTop / itemHeight);
      const clampedIdx = Math.max(0, Math.min(idx, options.length - 1));
      // Snap to nearest item
      containerRef.current.scrollTop = clampedIdx * itemHeight;
      const selectedValue = options[clampedIdx];
      if (selectedValue !== lastValueRef.current) {
        lastValueRef.current = selectedValue;
        onChange(selectedValue);
      }
    }, 80);
  };

  return (
    <div className="ios-picker-wheel-wrapper">
      <div
        className="ios-picker-wheel"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="ios-picker-wheel-spacer" />
        {options.map((opt, index) => (
          <div
            key={`${opt}-${index}`}
            className={`ios-picker-wheel-item ${opt === value ? "selected" : ""}`}
            onClick={() => {
              if (containerRef.current) {
                isUserScrollingRef.current = false;
                containerRef.current.scrollTo({
                  top: index * itemHeight,
                  behavior: "smooth",
                });
                setTimeout(() => onChange(opt), 200);
              }
            }}
          >
            {opt}
          </div>
        ))}
        <div className="ios-picker-wheel-spacer" />
      </div>
    </div>
  );
}
