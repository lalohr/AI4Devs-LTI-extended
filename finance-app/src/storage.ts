import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from './types';
import { emptyAppData } from './finance';

const STORAGE_KEY = 'finance-app:data:v1';

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAppData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      loans: Array.isArray(parsed.loans) ? parsed.loans : [],
    };
  } catch {
    return emptyAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
