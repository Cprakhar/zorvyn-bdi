import type { CreateTransactionInput, TransactionType } from "@/lib/types";

interface EditTransactionPanelProps {
  form: CreateTransactionInput;
  loading: boolean;
  onChange: (next: CreateTransactionInput) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EditTransactionPanel({
  form,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Readonly<EditTransactionPanelProps>) {
  return (
    <article className="panel">
      <h3>Edit Transaction</h3>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label htmlFor="editAmount">Amount</label>
          <input
            id="editAmount"
            type="number"
            min={1}
            value={form.amount || ""}
            onChange={(event) => onChange({ ...form, amount: Number(event.target.value) })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editType">Type</label>
          <select
            id="editType"
            value={form.type}
            onChange={(event) => onChange({ ...form, type: event.target.value as TransactionType })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="editCategory">Category</label>
          <input
            id="editCategory"
            value={form.category}
            onChange={(event) => onChange({ ...form, category: event.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editDate">Date</label>
          <input
            id="editDate"
            type="date"
            value={form.transactionDate}
            onChange={(event) => onChange({ ...form, transactionDate: event.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editDescription">Description</label>
          <input
            id="editDescription"
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
          />
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            Update Transaction
          </button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </article>
  );
}
