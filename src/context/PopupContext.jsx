"use client";
import { createContext, useContext, useCallback, useRef } from "react";

const PopupContext = createContext(null);

/**
 * Coordinates popups so only one shows at a time.
 * Each popup calls `requestOpen(id)` before opening.
 * Returns true if allowed, false if another popup is already visible.
 * Call `release(id)` when the popup closes.
 */
export function PopupProvider({ children }) {
  const activeRef = useRef(null);
  const listenersRef = useRef(new Set());
  const openListenersRef = useRef(new Set());

  const requestOpen = useCallback((id) => {
    if (activeRef.current && activeRef.current !== id) {
      return false; // another popup is showing
    }
    const wasClosed = activeRef.current !== id;
    activeRef.current = id;
    // Notify open-listeners when a popup actually takes the slot (used to
    // sequence one popup a fixed time after another one appears).
    if (wasClosed) {
      for (const cb of openListenersRef.current) {
        cb(id);
      }
    }
    return true;
  }, []);

  const release = useCallback((id) => {
    if (activeRef.current === id) {
      activeRef.current = null;
      // Notify waiting popups that the slot is free
      for (const cb of listenersRef.current) {
        cb();
      }
    }
  }, []);

  const isActive = useCallback((id) => {
    return activeRef.current === id;
  }, []);

  const onRelease = useCallback((cb) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  // Subscribe to "a popup opened" — cb receives the opened popup's id.
  const onOpen = useCallback((cb) => {
    openListenersRef.current.add(cb);
    return () => openListenersRef.current.delete(cb);
  }, []);

  return (
    <PopupContext.Provider
      value={{ requestOpen, release, isActive, onRelease, onOpen }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export function usePopupManager() {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    // Fallback: always allow if provider missing
    return {
      requestOpen: () => true,
      release: () => {},
      isActive: () => false,
      onRelease: () => () => {},
      onOpen: () => () => {},
    };
  }
  return ctx;
}
