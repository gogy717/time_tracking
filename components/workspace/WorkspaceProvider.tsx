"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WorkspaceView = "dashboard" | "domains" | "settings";

type WorkspaceContextValue = {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const STORAGE_KEY = "time-tracking:workspace-view";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<WorkspaceView>("dashboard");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved === "dashboard" || saved === "domains" || saved === "settings") {
      setViewState(saved);
    }
  }, []);

  const setView = (next: WorkspaceView) => {
    setViewState(next);
    window.sessionStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ view, setView }), [view]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return value;
}
