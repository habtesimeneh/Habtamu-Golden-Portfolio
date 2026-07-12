import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login.jsx";
import { toast } from "../components/Toast.jsx";

const navigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../components/Toast.jsx", () => ({
  toast: vi.fn(),
}));

function unlockGateway(code = "2121") {
  const input = screen.getByPlaceholderText("Enter Gateway PIN");
  fireEvent.change(input, { target: { value: code } });
  fireEvent.click(screen.getByRole("button", { name: "Unlock Pathway" }));
  act(() => {
    vi.advanceTimersByTime(1000);
  });
}

describe("Login", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigate.mockReset();
    toast.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("rejects an invalid gateway code", () => {
    render(<Login onLogin={vi.fn()} />);

    const input = screen.getByPlaceholderText("Enter Gateway PIN");
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "Unlock Pathway" }));

    expect(toast).toHaveBeenCalledWith(
      "Security rejection: Invalid signature code.",
      "error",
    );
    expect(screen.getByText("Port Access Denied")).toBeInTheDocument();
  });

  it("accepts the named gateway code", () => {
    render(<Login onLogin={vi.fn()} />);

    unlockGateway("HABTAMU");

    expect(screen.getByText("Authorized Sign-In")).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith(
      "Port authorized! Direct secure pathway opened.",
      "success",
    );
  });

  it("requires both login credentials", () => {
    render(<Login onLogin={vi.fn()} />);
    unlockGateway();

    fireEvent.submit(screen.getByText("Verify Credentials").closest("form"));

    expect(toast).toHaveBeenCalledWith(
      "Please enter both username and password",
      "error",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("authenticates and redirects after a successful response", async () => {
    const onLogin = vi.fn();
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        token: "secure-token",
        user: { id: 1, username: "Habtamu" },
      }),
    });
    render(<Login onLogin={onLogin} />);
    unlockGateway();
    vi.useRealTimers();

    fireEvent.change(screen.getByPlaceholderText("e.g. Habtamu simeneh"), {
      target: { value: "Habtamu" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Credentials" }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("secure-token", {
        id: 1,
        username: "Habtamu",
      });
    });
    expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Habtamu", password: "secret" }),
    });
    expect(navigate).toHaveBeenCalledWith("/admin");
  });

  it.each([
    [
      "shows the API error",
      () =>
        Promise.resolve({
          ok: false,
          json: vi.fn().mockResolvedValue({ error: "Invalid account" }),
        }),
      "Invalid account",
    ],
    [
      "handles a failed request",
      () => Promise.reject(new Error("offline")),
      "SQL Server handshake failed",
    ],
  ])("%s", async (_name, response, expectedMessage) => {
    fetch.mockImplementation(response);
    render(<Login onLogin={vi.fn()} />);
    unlockGateway();
    vi.useRealTimers();

    fireEvent.change(screen.getByPlaceholderText("e.g. Habtamu simeneh"), {
      target: { value: "Habtamu" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Credentials" }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expectedMessage, "error");
    });
  });
});
