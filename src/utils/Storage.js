const PREFIX = "conscious-particle";

export const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Storage load failed", error);
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage save failed", error);
  }
};
