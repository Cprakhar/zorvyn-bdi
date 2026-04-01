"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthPanel } from "@/components/dashboard/AuthPanel";
import { CreateTransactionPanel } from "@/components/dashboard/CreateTransactionPanel";
import { EditTransactionPanel } from "@/components/dashboard/EditTransactionPanel";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { Header } from "@/components/dashboard/Header";
import { Notifications } from "@/components/dashboard/Notifications";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TrendTable } from "@/components/dashboard/TrendTable";
import { UserManagementPanel } from "@/components/dashboard/UserManagementPanel";
import {
  ApiError,
  createUser,
  createTransaction,
  deleteTransaction,
  getUsers,
  getSummary,
  getTransactions,
  issueToken,
  updateTransaction,
  updateUser,
} from "../lib/api";
import type {
  AuthTokenResponse,
  CreateUserInput,
  CreateTransactionInput,
  DashboardSummary,
  PaginatedTransactions,
  TransactionType,
  User,
  UserRole,
} from "../lib/types";

const defaultNewTransaction: CreateTransactionInput = {
  amount: 0,
  type: "expense",
  category: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  description: "",
};

const defaultNewUser: CreateUserInput = {
  name: "",
  email: "",
  role: "viewer",
  isActive: true,
};

const dashboardStateKey = "fluxboard.auth";

export default function Home() {
  const [email, setEmail] = useState("admin@finance.local");
  const [auth, setAuth] = useState<AuthTokenResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<CreateTransactionInput>(defaultNewTransaction);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editTransactionForm, setEditTransactionForm] = useState<CreateTransactionInput>(defaultNewTransaction);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<CreateUserInput>(defaultNewUser);

  const role = auth?.user.role;
  const canReadTransactions = role === "analyst" || role === "admin";
  const canWrite = role === "admin";

  useEffect(() => {
    const saved = localStorage.getItem(dashboardStateKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthTokenResponse;
        if (parsed.accessToken && parsed.user?.email) {
          setAuth(parsed);
          setEmail(parsed.user.email);
        }
      } catch {
        localStorage.removeItem(dashboardStateKey);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!auth?.accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const summaryData = await getSummary(auth.accessToken);
      setSummary(summaryData);

      if (canReadTransactions) {
        const transactionData = await getTransactions(auth.accessToken, {
          type: typeFilter === "all" ? undefined : typeFilter,
          search: searchFilter || undefined,
          category: categoryFilter || undefined,
          page,
          pageSize,
        });
        setTransactions(transactionData);
      } else {
        setTransactions(null);
      }

      if (canWrite) {
        const usersData = await getUsers(auth.accessToken);
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken, canReadTransactions, canWrite, categoryFilter, page, pageSize, searchFilter, typeFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleLogin = async () => {
    setError(null);
    setOkMessage(null);
    setLoading(true);

    try {
      const session = await issueToken(email);
      setAuth(session);
      localStorage.setItem(dashboardStateKey, JSON.stringify(session));
      setOkMessage(`Signed in as ${session.user.role}`);
      setPage(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not authenticate user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setAuth(null);
    setSummary(null);
    setTransactions(null);
    setError(null);
    setOkMessage("Signed out");
    localStorage.removeItem(dashboardStateKey);
  };

  const handleCreateTransaction = async () => {
    if (!auth?.accessToken) {
      setError("Sign in first");
      return;
    }

    setError(null);
    setOkMessage(null);
    try {
      await createTransaction(auth.accessToken, {
        ...newTransaction,
        transactionDate: new Date(newTransaction.transactionDate).toISOString(),
      });

      setOkMessage("Transaction created successfully");
      setNewTransaction(defaultNewTransaction);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create transaction");
      }
    }
  };

  const handleStartEditTransaction = (transactionId: string) => {
    const transaction = transactions?.items.find((item) => item.id === transactionId);
    if (!transaction) {
      return;
    }

    setEditingTransactionId(transaction.id);
    setEditTransactionForm({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      transactionDate: new Date(transaction.transactionDate).toISOString().slice(0, 10),
      description: transaction.description ?? "",
    });
  };

  const handleUpdateTransaction = async () => {
    if (!auth?.accessToken || !editingTransactionId) {
      return;
    }

    setError(null);
    setOkMessage(null);
    try {
      await updateTransaction(auth.accessToken, editingTransactionId, {
        ...editTransactionForm,
        transactionDate: new Date(editTransactionForm.transactionDate).toISOString(),
      });

      setOkMessage("Transaction updated successfully");
      setEditingTransactionId(null);
      setEditTransactionForm(defaultNewTransaction);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update transaction");
      }
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!auth?.accessToken) {
      return;
    }

    if (!globalThis.confirm("Delete this transaction? This action cannot be undone.")) {
      return;
    }

    setDeletingTransactionId(transactionId);
    setError(null);
    setOkMessage(null);

    try {
      await deleteTransaction(auth.accessToken, transactionId);
      setOkMessage("Transaction deleted successfully");

      if (editingTransactionId === transactionId) {
        setEditingTransactionId(null);
        setEditTransactionForm(defaultNewTransaction);
      }

      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete transaction");
      }
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!auth?.accessToken || auth.user.role !== "admin") {
      setError("Only admins can manage users");
      return;
    }

    setError(null);
    setOkMessage(null);
    try {
      await createUser(auth.accessToken, newUser);
      setOkMessage("User created successfully");
      setNewUser(defaultNewUser);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create user");
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    if (!auth?.accessToken || auth.user.role !== "admin") {
      return;
    }

    setError(null);
    setOkMessage(null);
    try {
      await updateUser(auth.accessToken, userId, { role });
      setOkMessage("User role updated");
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update role");
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!auth?.accessToken || auth.user.role !== "admin") {
      return;
    }

    setError(null);
    setOkMessage(null);
    try {
      await updateUser(auth.accessToken, userId, { isActive });
      setOkMessage(`User ${isActive ? "activated" : "deactivated"}`);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update user status");
      }
    }
  };

  return (
    <main className="page-shell">
      <Header isAuthenticated={Boolean(auth)} onSignOut={handleSignOut} />
      <SummaryCards summary={summary} />

      <section className="grid content">
        <aside className="stack">
          <AuthPanel
            email={email}
            auth={auth}
            loading={loading}
            onEmailChange={setEmail}
            onSubmit={() => {
              void handleLogin();
            }}
          />

          {canReadTransactions ? (
            <FiltersPanel
              typeFilter={typeFilter}
              categoryFilter={categoryFilter}
              searchFilter={searchFilter}
              pageSize={pageSize}
              onTypeFilterChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              onSearchFilterChange={(value) => {
                setSearchFilter(value);
                setPage(1);
              }}
              onCategoryFilterChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
            />
          ) : (
            <article className="panel">
              <h3>Access Level</h3>
              <p style={{ margin: 0 }}>
                Viewer mode: summary analytics only. Transaction records and management tools are hidden.
              </p>
            </article>
          )}

          {canWrite ? (
            <>
              <CreateTransactionPanel
                form={newTransaction}
                onChange={setNewTransaction}
                onSubmit={() => {
                  void handleCreateTransaction();
                }}
              />

              {editingTransactionId ? (
                <EditTransactionPanel
                  form={editTransactionForm}
                  loading={loading}
                  onChange={setEditTransactionForm}
                  onSubmit={() => {
                    void handleUpdateTransaction();
                  }}
                  onCancel={() => {
                    setEditingTransactionId(null);
                    setEditTransactionForm(defaultNewTransaction);
                  }}
                />
              ) : null}

              <UserManagementPanel
                users={users}
                form={newUser}
                loading={loading}
                onFormChange={setNewUser}
                onCreateUser={() => {
                  void handleCreateUser();
                }}
                onUpdateUserRole={(userId, role) => {
                  void handleUpdateUserRole(userId, role);
                }}
                onToggleUserStatus={(userId, nextStatus) => {
                  void handleToggleUserStatus(userId, nextStatus);
                }}
              />
            </>
          ) : null}
        </aside>

        <div className="stack">
          <Notifications error={error} okMessage={okMessage} />

          {canReadTransactions ? (
            <TransactionsTable
              transactions={transactions}
              canManage={canWrite}
              deletingId={deletingTransactionId}
              onEdit={(transactionId) => {
                handleStartEditTransaction(transactionId);
              }}
              onDelete={(transactionId) => {
                void handleDeleteTransaction(transactionId);
              }}
              onPreviousPage={() => setPage((prev) => Math.max(1, prev - 1))}
              onNextPage={() =>
                setPage((prev) =>
                  transactions
                    ? Math.min(transactions.pagination.totalPages, prev + 1)
                    : prev
                )
              }
            />
          ) : null}

          <TrendTable summary={summary} />
        </div>
      </section>
    </main>
  );
}
