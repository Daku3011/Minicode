import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import AccountStatus from "../src/components/AccountStatus";

const mocks = vi.hoisted(() => ({ me: vi.fn(), deleteCookie: vi.fn() }));
vi.mock("cookies-next", () => ({
  getCookie: () => "saved-token",
  deleteCookie: mocks.deleteCookie,
  setCookie: vi.fn(),
}));
vi.mock("@/lib/api", () => ({
  default: { defaults: { headers: { common: {} } } },
  userApi: { me: mocks.me },
}));
function Identity() {
  const { user } = useAuth();
  return <span>{user?.username ?? "Waiting"}</span>;
}

describe("Account recovery", () => {
  it("retains the session on temporary failure and lets the user retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.me
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { username: "student" } });
    render(
      <AuthProvider>
        <AccountStatus />
        <Identity />
      </AuthProvider>,
    );
    await screen.findByRole("alert");
    expect(mocks.deleteCookie).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry connection" }));
    await waitFor(() =>
      expect(screen.getByText("student")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
