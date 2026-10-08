import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'roomie_onboarding_progress';
const FILTERS_KEY = 'roomie_discovery_filters';

export async function saveOnboardingProgress(step: string, data: Record<string, unknown>) {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...prev, [step]: data, _step: step }));
  } catch {
    /* non-critical */
  }
}

export async function loadOnboardingProgress(): Promise<Record<string, unknown>> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function clearOnboardingProgress() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    /* noop */
  }
}

export async function saveFilters(filters: object) {
  try {
    await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    /* noop */
  }
}

export async function loadFilters<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(FILTERS_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
