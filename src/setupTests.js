// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Create jest compatibility layer for existing tests
globalThis.jest = vi;

// Node 22+ exposes a native localStorage that conflicts with jsdom's implementation.
// Ensure localStorage has all standard Web Storage API methods.
if (typeof localStorage !== "undefined" && typeof localStorage.getItem !== "function") {
  const store = {};
  const storage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] ?? null,
  };
  Object.defineProperty(globalThis, "localStorage", { value: storage, writable: true, configurable: true });
}
