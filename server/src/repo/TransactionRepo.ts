import { DataSource, Repository } from "typeorm";
import { Transaction, TransactionType } from "../entity/Transaction";

export interface TransactionFilters {
	type?: TransactionType;
	category?: string;
	startDate?: Date;
	endDate?: Date;
	page: number;
	pageSize: number;
}

export interface PaginatedResult<T> {
	items: T[];
	pagination: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}

export interface CreateTransactionInput {
	amount: number;
	type: TransactionType;
	category: string;
	transactionDate: Date;
	description?: string | null;
	createdById: string;
}

export interface UpdateTransactionInput {
	amount?: number;
	type?: TransactionType;
	category?: string;
	transactionDate?: Date;
	description?: string | null;
}

export interface DashboardSummary {
	totalIncome: number;
	totalExpense: number;
	netBalance: number;
	categoryTotals: Array<{ category: string; total: number }>;
	recentActivity: Transaction[];
	monthlyTrends: Array<{ month: string; income: number; expense: number }>;
}

export class TransactionRepo {
	private readonly repository: Repository<Transaction>;

	constructor(dataSource: DataSource) {
		this.repository = dataSource.getRepository(Transaction);
	}

	create(input: CreateTransactionInput): Promise<Transaction> {
		const entity = this.repository.create({
			amount: input.amount,
			type: input.type,
			category: input.category,
			transactionDate: input.transactionDate,
			description: input.description ?? null,
			createdById: input.createdById,
		});

		return this.repository.save(entity);
	}

	async list(filters: TransactionFilters): Promise<PaginatedResult<Transaction>> {
		const query = this.repository
			.createQueryBuilder("transaction")
			.orderBy("transaction.transactionDate", "DESC");

		if (filters.type) {
			query.andWhere("transaction.type = :type", { type: filters.type });
		}

		if (filters.category) {
			query.andWhere("LOWER(transaction.category) = LOWER(:category)", {
				category: filters.category,
			});
		}

		if (filters.startDate) {
			query.andWhere("transaction.transactionDate >= :startDate", {
				startDate: filters.startDate.toISOString(),
			});
		}

		if (filters.endDate) {
			query.andWhere("transaction.transactionDate <= :endDate", {
				endDate: filters.endDate.toISOString(),
			});
		}

		const skip = (filters.page - 1) * filters.pageSize;
		query.skip(skip).take(filters.pageSize);

		const [items, totalItems] = await query.getManyAndCount();
		return {
			items,
			pagination: {
				page: filters.page,
				pageSize: filters.pageSize,
				totalItems,
				totalPages: Math.max(1, Math.ceil(totalItems / filters.pageSize)),
			},
		};
	}

	findById(id: string): Promise<Transaction | null> {
		return this.repository.findOne({ where: { id } });
	}

	async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
		const transaction = await this.findById(id);
		if (!transaction) {
			return null;
		}

		Object.assign(transaction, input);
		return this.repository.save(transaction);
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.repository.delete({ id });
		return (result.affected ?? 0) > 0;
	}

	async summarize(): Promise<DashboardSummary> {
		const transactions = await this.repository.find({
			order: { transactionDate: "DESC" },
		});

		let totalIncome = 0;
		let totalExpense = 0;
		const categoryMap = new Map<string, number>();
		const monthlyMap = new Map<string, { income: number; expense: number }>();

		for (const item of transactions) {
			if (item.type === TransactionType.INCOME) {
				totalIncome += item.amount;
			} else {
				totalExpense += item.amount;
			}

			categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + item.amount);

			const month = item.transactionDate.toISOString().slice(0, 7);
			const monthEntry = monthlyMap.get(month) ?? { income: 0, expense: 0 };
			if (item.type === TransactionType.INCOME) {
				monthEntry.income += item.amount;
			} else {
				monthEntry.expense += item.amount;
			}
			monthlyMap.set(month, monthEntry);
		}

		return {
			totalIncome,
			totalExpense,
			netBalance: totalIncome - totalExpense,
			categoryTotals: Array.from(categoryMap.entries())
				.map(([category, total]) => ({ category, total }))
				.sort((a, b) => b.total - a.total),
			recentActivity: transactions.slice(0, 10),
			monthlyTrends: Array.from(monthlyMap.entries())
				.map(([month, value]) => ({ month, income: value.income, expense: value.expense }))
				.sort((a, b) => a.month.localeCompare(b.month)),
		};
	}
}