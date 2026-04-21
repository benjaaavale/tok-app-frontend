"use client";

import { useState, useCallback } from "react";
import { DEFAULT_WIDGET_IDS, STORAGE_KEY } from "@/types/dashboard";

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return DEFAULT_WIDGET_IDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_IDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_WIDGET_IDS;
  } catch {
    return DEFAULT_WIDGET_IDS;
  }
}

function saveToStorage(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // silently fail
  }
}

export function useDashboardLayout() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(loadFromStorage);

  const updateLayout = useCallback((ids: string[]) => {
    setSelectedWidgets(ids);
    saveToStorage(ids);
  }, []);

  const resetLayout = useCallback(() => {
    setSelectedWidgets(DEFAULT_WIDGET_IDS);
    saveToStorage(DEFAULT_WIDGET_IDS);
  }, []);

  return { selectedWidgets, updateLayout, resetLayout };
}
