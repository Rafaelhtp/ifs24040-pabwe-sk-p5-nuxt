import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// Mock method DOM yang tidak tersedia di jsdom
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});
