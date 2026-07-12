import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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

vi.mock("motion/react", () => {
  const motionProps = new Set([
    "animate",
    "exit",
    "initial",
    "layout",
    "transition",
    "variants",
    "whileHover",
    "whileTap",
  ]);

  return {
    AnimatePresence: ({ children }) => children,
    motion: new Proxy(
      {},
      {
        get: (_, tag) =>
          React.forwardRef(({ children, ...props }, ref) => {
            const domProps = Object.fromEntries(
              Object.entries(props).filter(([key]) => !motionProps.has(key)),
            );
            return React.createElement(tag, { ...domProps, ref }, children);
          }),
      },
    ),
  };
});
