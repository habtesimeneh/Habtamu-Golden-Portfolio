import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ToastContainer", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders each toast style and supports manual and automatic dismissal", async () => {
    const { ToastContainer, toast } = await import("./Toast.jsx");
    const { unmount } = render(<ToastContainer />);

    act(() => {
      toast("Saved");
      toast("Rejected", "error");
      toast("Notice", "info");
    });

    expect(screen.getByText("Saved").parentElement).toHaveClass("text-green-400");
    expect(screen.getByText("Rejected").parentElement).toHaveClass("text-red-400");
    expect(screen.getByText("Notice").parentElement).toHaveClass("text-gold-400");

    fireEvent.click(
      within(screen.getByText("Rejected").parentElement).getByRole("button"),
    );
    expect(screen.queryByText("Rejected")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    expect(screen.queryByText("Notice")).not.toBeInTheDocument();

    unmount();
    act(() => {
      toast("No active listener");
      vi.advanceTimersByTime(4000);
    });
  });
});
