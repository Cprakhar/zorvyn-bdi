import type { PaginatedTransactions } from "@/lib/types";
import { money } from "@/lib/format";

interface TransactionsTableProps {
  transactions: PaginatedTransactions | null;
  canManage: boolean;
  deletingId: string | null;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function TransactionsTable({
  transactions,
  canManage,
  deletingId,
  onEdit,
  onDelete,
  onPreviousPage,
  onNextPage,
}: Readonly<TransactionsTableProps>) {
  return (
    <article className="panel">
      <h3>Recent Transactions</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Notes</th>
              {canManage ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {(transactions?.items ?? []).map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.transactionDate).toLocaleDateString()}</td>
                <td>{item.category}</td>
                <td style={{ textTransform: "capitalize" }}>{item.type}</td>
                <td className={item.type === "income" ? "income mono" : "expense mono"}>
                  {money(item.amount)}
                </td>
                <td>{item.description || "-"}</td>
                {canManage ? (
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {(transactions?.items.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={canManage ? 6 : 5}>No records found for current filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <p style={{ margin: 0, color: "#5a6874" }}>
          {transactions
            ? `Page ${transactions.pagination.page} of ${transactions.pagination.totalPages} (${transactions.pagination.totalItems} rows)`
            : "No data yet"}
        </p>
        <div className="actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onPreviousPage}
            disabled={!transactions || transactions.pagination.page <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onNextPage}
            disabled={!transactions || transactions.pagination.page >= transactions.pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </article>
  );
}
