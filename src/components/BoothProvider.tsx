"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FrameItem } from "@/lib/frame-layout";
import type { PhotoFilter } from "@/lib/photo-filters";
import { BOOTH_STORAGE_KEY, initialBoothState, restoreBoothState, retakeState, type BoothState } from "@/lib/booth-state";
type BoothContext = {
  state: BoothState; ready: boolean; storageWarning: boolean;
  chooseFrame: (frame: FrameItem) => void;
  addPhoto: (photo: string) => void;
  chooseFilter: (filter: PhotoFilter) => void;
  retake: () => void;
};
const Context = createContext<BoothContext | null>(null);
export function BoothProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialBoothState);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    let active = true;
    // Restore after hydration; guards wait for ready before redirecting.
    Promise.resolve().then(() => {
      if (!active) return;
      try { setState(restoreBoothState(sessionStorage.getItem(BOOTH_STORAGE_KEY))); }
      catch { setStorageWarning(true); }
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(BOOTH_STORAGE_KEY, JSON.stringify(state)); }
    catch {
      // Never restore an older strip after a quota/storage failure.
      try { sessionStorage.removeItem(BOOTH_STORAGE_KEY); } catch { /* Storage is unavailable. */ }
      Promise.resolve().then(() => setStorageWarning(true));
    }
  }, [ready, state]);
  const chooseFrame = useCallback((frame: FrameItem) => setState({ ...initialBoothState, selectedFrame: frame }), []);
  const addPhoto = useCallback((photo: string) => setState(current => current.capturedPhotos.length >= 4 ? current : { ...current, capturedPhotos: [...current.capturedPhotos, photo], capturedAt: current.capturedAt || new Date().toISOString() }), []);
  const chooseFilter = useCallback((filter: PhotoFilter) => setState(current => ({ ...current, selectedFilter: filter })), []);
  const retake = useCallback(() => setState(retakeState), []);
  return <Context.Provider value={{ state, ready, storageWarning, chooseFrame, addPhoto, chooseFilter, retake }}>{children}</Context.Provider>;
}
export function useBooth() {
  const context = useContext(Context);
  if (!context) throw new Error("BoothProvider is missing.");
  return context;
}
