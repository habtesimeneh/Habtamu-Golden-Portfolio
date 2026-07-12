import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext.jsx";

function ThemeControls() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>{theme}</button>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it("uses the saved theme and synchronizes the document", () => {
    localStorage.setItem("app_theme", "dark");

    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(localStorage.getItem("app_theme")).toBe("dark");
  });

  it("uses the system preference and toggles it", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "dark" }));

    expect(screen.getByRole("button", { name: "light" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("app_theme")).toBe("light");
  });

  it("rejects use outside the provider", () => {
    expect(() => render(<ThemeControls />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });
});
