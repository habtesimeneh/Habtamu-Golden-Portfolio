import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Contact from "./Contact.jsx";
import { toast } from "../components/Toast.jsx";

vi.mock("../components/Toast.jsx", () => ({
  toast: vi.fn(),
}));

function submitForm() {
  fireEvent.submit(screen.getByText("Send Your Message").closest("form"));
}

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("Dawit Abebe"), {
    target: { value: "Test User" },
  });
  fireEvent.change(screen.getByPlaceholderText("client@company.com"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(
    screen.getByPlaceholderText("Describe your requirements or opportunities here..."),
    { target: { value: "Please contact me." } },
  );
}

describe("Contact", () => {
  beforeEach(() => {
    toast.mockReset();
    global.fetch = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("validates required fields before submitting", () => {
    render(<Contact />);

    submitForm();

    expect(toast).toHaveBeenCalledWith(
      "Please fill in all required fields",
      "error",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits a message and resets the form", async () => {
    fetch.mockResolvedValue({ ok: true });
    render(<Contact />);
    fillRequiredFields();
    fireEvent.change(
      screen.getByPlaceholderText("e.g. Software Engineering Opening"),
      { target: { value: "Project inquiry" } },
    );

    submitForm();

    await screen.findByText("Database Synchronized!");
    expect(fetch).toHaveBeenCalledWith("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_name: "Test User",
        sender_email: "test@example.com",
        subject: "Project inquiry",
        message: "Please contact me.",
      }),
    });
    expect(toast).toHaveBeenCalledWith(
      "Message sent successfully!",
      "success",
    );

    fireEvent.click(screen.getByRole("button", { name: "Send Another Message" }));
    expect(screen.getByPlaceholderText("Dawit Abebe")).toHaveValue("");
  });

  it.each([
    [
      "shows an API error",
      () =>
        Promise.resolve({
          ok: false,
          json: vi.fn().mockResolvedValue({ error: "Message rejected" }),
        }),
      "Message rejected",
    ],
    [
      "handles a network failure",
      () => Promise.reject(new Error("offline")),
      "Network error. Please try again later.",
    ],
  ])("%s", async (_name, response, expectedMessage) => {
    fetch.mockImplementation(response);
    render(<Contact />);
    fillRequiredFields();

    submitForm();

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expectedMessage, "error");
    });
  });

  it("copies the email address and clears the copied state", () => {
    vi.useFakeTimers();
    render(<Contact />);

    fireEvent.click(screen.getByTitle("Copy Email Address"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "habtesimeneh30@gmail.com",
    );
    expect(toast).toHaveBeenCalledWith(
      "Email copied to clipboard!",
      "success",
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});
