export type UserRole = "viewer" | "analyst" | "admin";

export type TransactionType = "income" | "expense";

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryTotals: Array<{ category: string; total: number }>;
  recentActivity: Transaction[];
  monthlyTrends: Array<{ month: string; income: number; expense: number }>;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  transactionDate: string;
  description: string | null;
  createdById: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  transactionDate: string;
  description?: string;
}
