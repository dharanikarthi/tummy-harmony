const KEY = 'gutsense_user';

export const isLoggedIn = (): boolean => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const u = JSON.parse(raw);
    return !!(u?.name && u?.email && u?.loggedOut !== true);
  } catch {
    return false;
  }
};

export const hasCompletedSetup = (): boolean => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const u = JSON.parse(raw);
    return u?.setupCompleted === true && !!(u?.gutCondition || u?.allConditions?.length > 0);
  } catch {
    return false;
  }
};
