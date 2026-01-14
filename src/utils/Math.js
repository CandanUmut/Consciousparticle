export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const lerp = (a, b, t) => a + (b - a) * t;

export const randRange = (min, max) => Math.random() * (max - min) + min;

export const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const vecLength = (x, y, z = 0) => Math.sqrt(x * x + y * y + z * z);

export const normalizeVec = (x, y, z = 0) => {
  const len = vecLength(x, y, z) || 1;
  return [x / len, y / len, z / len];
};

export const seededRandom = (seed) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
};
