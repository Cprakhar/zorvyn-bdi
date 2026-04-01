import type { DashboardSummary } from "@/lib/types";
import { money } from "@/lib/format";

interface TrendTableProps {
  summary: DashboardSummary | null;
}

export function TrendTable({ summary }: Readonly<TrendTableProps>) {
  const trendPreview = summary?.monthlyTrends.slice(-4) ?? [];

  return (
    <article className="panel">
      <h3>Monthly Trend Snapshot</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expense</th>
            </tr>
          </thead>
          <tbody>
            {trendPreview.map((trend) => (
              <tr key={trend.month}>
                <td className="mono">{trend.month}</td>
                <td className="income mono">{money(trend.income)}</td>
                <td className="expense mono">{money(trend.expense)}</td>
              </tr>
            ))}
            {trendPreview.length === 0 ? (
              <tr>
                <td colSpan={3}>No trend data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
