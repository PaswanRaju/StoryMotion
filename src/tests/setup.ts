import '@testing-library/jest-dom/vitest';

// jsdom has no canvas backend; the forest scene treats a null context as "no particles".
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext;
