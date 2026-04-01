import type { DashboardSummary } from "@/lib/types";
import { money } from "@/lib/format";

interface SummaryCardsProps {
  summary: DashboardSummary | null;
}

export function SummaryCards({ summary }: Readonly<SummaryCardsProps>) {
  return (
    <section className="grid summary-grid">
      <article className="panel">
        <h3>Total Income</h3>
        <p className="stat income">{money(summary?.totalIncome ?? 0)}</p>
      </article>
      <article className="panel">
        <h3>Total Expense</h3>
        <p className="stat expense">{money(summary?.totalExpense ?? 0)}</p>
      </article>
      <article className="panel">
        <h3>Net Balance</h3>
        <p className={`stat ${(summary?.netBalance ?? 0) >= 0 ? "income" : "expense"}`}>
          {money(summary?.netBalance ?? 0)}
        </p>
      </article>
    </section>
  );
}
