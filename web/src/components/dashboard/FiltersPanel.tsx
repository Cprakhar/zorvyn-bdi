import type { TransactionType } from "@/lib/types";

interface FiltersPanelProps {
  typeFilter: "all" | TransactionType;
  categoryFilter: string;
  pageSize: number;
  onTypeFilterChange: (value: "all" | TransactionType) => void;
  onCategoryFilterChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
}

export function FiltersPanel({
  typeFilter,
  categoryFilter,
  pageSize,
  onTypeFilterChange,
  onCategoryFilterChange,
  onPageSizeChange,
}: Readonly<FiltersPanelProps>) {
  return (
    <article className="panel">
      <h3>Filters</h3>
      <div className="stack">
        <div className="field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={typeFilter}
            onChange={(event) => onTypeFilterChange(event.target.value as "all" | TransactionType)}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            placeholder="Food, Rent, Salary"
          />
        </div>
        <div className="field">
          <label htmlFor="pageSize">Rows per page</label>
          <select
            id="pageSize"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </article>
  );
}
