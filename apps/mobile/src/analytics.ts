import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logAppOpen,
  logScreenView,
  type Analytics,
} from '@react-native-firebase/analytics';
import type { Section } from './scroll';

/**
 * Best-effort Firebase Analytics wrapper: every call swallows errors so an
 * analytics hiccup (missing config, offline, native module issue) can never
 * crash the app or block a user action.
 *
 * The native SDK auto-initializes on Android from google-services.json at
 * launch; getApp() only fails when the native module/config is absent.
 */

const SCREEN_NAMES: Record<Section | 'home', string> = {
  home: 'home',
  workflow: 'workflow',
  projects: 'projects',
  contact: 'contact',
};

export function screenName(section: Section | '' | null): string {
  return SCREEN_NAMES[section || 'home'];
}

let instance: Analytics | null = null;

function get(): Analytics | null {
  if (instance) return instance;
  try {
    instance = getAnalytics(getApp());
    return instance;
  } catch {
    return null;
  }
}

export async function initAnalytics(): Promise<void> {
  try {
    const analytics = get();
    if (!analytics) return;
    await logAppOpen(analytics);
  } catch {
    // Analytics unavailable — ignore.
  }
}

export async function logScreen(section: Section | ''): Promise<void> {
  try {
    const analytics = get();
    if (!analytics) return;
    const name = screenName(section);
    await logScreenView(analytics, { screen_name: name, screen_class: name });
  } catch {
    // Analytics unavailable — ignore.
  }
}
