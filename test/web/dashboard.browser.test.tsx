import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import Home from "../../web/src/app/page";

vi.mock("../../web/src/lib/api", () => {
  class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }

  return {
    API_BASE_URL: "http://localhost:3000",
    ApiError,
    issueToken: vi.fn(),
    getSummary: vi.fn(),
    getTransactions: vi.fn(),
    getUsers: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  };
});

import * as api from "../../web/src/lib/api";

describe("Dashboard role-aware UI", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    vi.mocked(api.getSummary).mockResolvedValue({
      totalIncome: 12000,
      totalExpense: 3000,
      netBalance: 9000,
      categoryTotals: [],
      recentActivity: [],
      monthlyTrends: [],
    });

    vi.mocked(api.getTransactions).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
      },
    });

    vi.mocked(api.getUsers).mockResolvedValue([]);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  const mountPage = async () => {
    root.render(<Home />);
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Fluxboard Finance Console");
      expect(container.textContent).toContain("Get Token");
    });
  };

  const loginAs = async (role: "viewer" | "analyst" | "admin") => {
    vi.mocked(api.issueToken).mockResolvedValue({
      accessToken: `${role}-token`,
      tokenType: "Bearer",
      expiresIn: "12h",
      user: {
        id: `${role}-id`,
        email: `${role}@finance.local`,
        role,
      },
    });

    const form = container.querySelector("form") as HTMLFormElement | null;
    expect(form).not.toBeNull();

    form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => {
      expect(api.issueToken).toHaveBeenCalledTimes(1);
    });
  };

  it("hides transaction and management sections for viewer", async () => {
    await mountPage();
    await loginAs("viewer");

    await vi.waitFor(() => {
      expect(api.getSummary).toHaveBeenCalledTimes(1);
    });

    expect(api.getTransactions).not.toHaveBeenCalled();
    expect(api.getUsers).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Viewer mode: summary analytics only");
    expect(container.textContent).not.toContain("Recent Transactions");
    expect(container.textContent).not.toContain("User Management");
  });

  it("shows transaction and user sections for admin", async () => {
    await mountPage();
    await loginAs("admin");

    await vi.waitFor(() => {
      expect(api.getSummary).toHaveBeenCalledTimes(1);
      expect(api.getTransactions).toHaveBeenCalledTimes(1);
      expect(api.getUsers).toHaveBeenCalledTimes(1);
    });

    expect(container.textContent).toContain("Recent Transactions");
    expect(container.textContent).toContain("User Management");
  });
});
