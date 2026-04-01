import type {
  AuthTokenResponse,
  CreateUserInput,
  CreateTransactionInput,
  DashboardSummary,
  PaginatedTransactions,
  TransactionFilters,
  UpdateTransactionInput,
  UpdateUserInput,
  User,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildQuery = (filters: TransactionFilters): string => {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 10));

  const query = params.toString();
  return query.length > 0 ? `?${query}` : "";
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(body.error ?? "Request failed", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const issueToken = (email: string): Promise<AuthTokenResponse> => {
  return request<AuthTokenResponse>("/auth/token", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const getSummary = (token: string): Promise<DashboardSummary> => {
  return request<DashboardSummary>("/dashboard/summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTransactions = (
  token: string,
  filters: TransactionFilters
): Promise<PaginatedTransactions> => {
  return request<PaginatedTransactions>(`/transactions${buildQuery(filters)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTransaction = (
  token: string,
  payload: CreateTransactionInput
): Promise<void> => {
  return request<void>("/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateTransaction = (
  token: string,
  transactionId: string,
  payload: UpdateTransactionInput
): Promise<void> => {
  return request<void>(`/transactions/${transactionId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const deleteTransaction = (token: string, transactionId: string): Promise<void> => {
  return request<void>(`/transactions/${transactionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUsers = (token: string): Promise<User[]> => {
  return request<User[]>("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createUser = (token: string, payload: CreateUserInput): Promise<User> => {
  return request<User>("/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateUser = (
  token: string,
  userId: string,
  payload: UpdateUserInput
): Promise<User> => {
  return request<User>(`/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export { API_BASE_URL, ApiError };
