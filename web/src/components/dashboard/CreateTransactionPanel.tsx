import type { CreateTransactionInput, TransactionType } from "@/lib/types";

interface CreateTransactionPanelProps {
  form: CreateTransactionInput;
  onChange: (next: CreateTransactionInput) => void;
  onSubmit: () => void;
}

export function CreateTransactionPanel({
  form,
  onChange,
  onSubmit,
}: Readonly<CreateTransactionPanelProps>) {
  return (
    <article className="panel">
      <h3>Create Transaction</h3>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min={1}
            value={form.amount || ""}
            onChange={(event) => onChange({ ...form, amount: Number(event.target.value) })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newType">Type</label>
          <select
            id="newType"
            value={form.type}
            onChange={(event) => onChange({ ...form, type: event.target.value as TransactionType })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="newCategory">Category</label>
          <input
            id="newCategory"
            value={form.category}
            onChange={(event) => onChange({ ...form, category: event.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newDate">Date</label>
          <input
            id="newDate"
            type="date"
            value={form.transactionDate}
            onChange={(event) => onChange({ ...form, transactionDate: event.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="newDescription">Description</label>
          <input
            id="newDescription"
            value={form.description ?? ""}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Save Transaction
        </button>
      </form>
    </article>
  );
}
