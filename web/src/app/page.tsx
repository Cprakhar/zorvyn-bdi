"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthPanel } from "@/components/dashboard/AuthPanel";
import { CreateTransactionPanel } from "@/components/dashboard/CreateTransactionPanel";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { Header } from "@/components/dashboard/Header";
import { Notifications } from "@/components/dashboard/Notifications";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TrendTable } from "@/components/dashboard/TrendTable";
import {
  ApiError,
  createTransaction,
  getSummary,
  getTransactions,
  issueToken,
} from "../lib/api";
import type {
  AuthTokenResponse,
  CreateTransactionInput,
  DashboardSummary,
  PaginatedTransactions,
  TransactionType,
} from "../lib/types";

const defaultNewTransaction: CreateTransactionInput = {
  amount: 0,
  type: "expense",
  category: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  description: "",
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
      const [summaryData, transactionData] = await Promise.all([
        getSummary(auth.accessToken),
        getTransactions(auth.accessToken, {
          type: typeFilter === "all" ? undefined : typeFilter,
          search: searchFilter || undefined,
          category: categoryFilter || undefined,
          page,
          pageSize,
        }),
      ]);

      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken, categoryFilter, page, pageSize, searchFilter, typeFilter]);

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

  const canWrite = auth?.user.role === "admin";

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

          {canWrite ? (
            <CreateTransactionPanel
              form={newTransaction}
              onChange={setNewTransaction}
              onSubmit={() => {
                void handleCreateTransaction();
              }}
            />
          ) : null}
        </aside>

        <div className="stack">
          <Notifications error={error} okMessage={okMessage} />

          <TransactionsTable
            transactions={transactions}
            onPreviousPage={() => setPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() =>
              setPage((prev) =>
                transactions
                  ? Math.min(transactions.pagination.totalPages, prev + 1)
                  : prev
              )
            }
          />

          <TrendTable summary={summary} />
        </div>
      </section>
    </main>
  );
}
