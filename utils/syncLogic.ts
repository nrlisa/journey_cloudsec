
import { AppState } from '../types';

const DECAY_RATE = 10; // 10% drop
const RESTORATION_BOOST = 25; // +25% per lab
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const applyDecay = (state: AppState): AppState => {
  if (state.maintenanceMode) return state;

  const now = new Date();
  const lastDecay = new Date(state.lastDecayTimestamp);
  const diffMs = now.getTime() - lastDecay.getTime();
  const daysPassed = Math.floor(diffMs / MS_PER_DAY);

  if (daysPassed >= 1) {
    const totalDrop = daysPassed * DECAY_RATE;
    const newSync = Math.max(0, state.syncPercentage - totalDrop);
    
    // Update the timestamp to the most recent 24h block processed
    const nextDecayTimestamp = new Date(lastDecay.getTime() + daysPassed * MS_PER_DAY).toISOString();

    return {
      ...state,
      syncPercentage: newSync,
      lastDecayTimestamp: nextDecayTimestamp,
    };
  }

  return state;
};

export const updateStreak = (state: AppState): AppState => {
  const today = new Date().toISOString().split('T')[0];
  
  // If already updated today, skip
  if (state.lastStreakUpdateDate === today) return state;

  if (state.syncPercentage >= 80) {
    return {
      ...state,
      streak: state.streak + 1,
      lastStreakUpdateDate: today
    };
  } else {
    // If we missed a day and the sync is low, streak breaks
    // However, if sync dropped below 80 just now, we check if it was checked yesterday
    // To keep it simple: if you check today and you're under 80, streak resets.
    return {
      ...state,
      streak: 0,
      lastStreakUpdateDate: today
    };
  }
};
