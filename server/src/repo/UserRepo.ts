import { DataSource, Repository } from "typeorm";
import { User, UserRole } from "../entity/User";

export interface CreateUserInput {
	email: string;
	name: string;
	role?: UserRole;
	isActive?: boolean;
	passwordHash?: string | null;
}

export interface UpdateUserInput {
	email?: string;
	name?: string;
	role?: UserRole;
	isActive?: boolean;
	passwordHash?: string | null;
}

export class UserRepo {
	private readonly repository: Repository<User>;

	constructor(dataSource: DataSource) {
		this.repository = dataSource.getRepository(User);
	}

	create(input: CreateUserInput): Promise<User> {
		const entity = this.repository.create({
			email: input.email,
			name: input.name,
			role: input.role ?? UserRole.VIEWER,
			isActive: input.isActive ?? true,
			passwordHash: input.passwordHash ?? null,
		});

		return this.repository.save(entity);
	}

	list(): Promise<User[]> {
		return this.repository.find({ order: { createdAt: "DESC" } });
	}

	findById(id: string): Promise<User | null> {
		return this.repository.findOne({ where: { id } });
	}

	findByEmail(email: string): Promise<User | null> {
		return this.repository.findOne({ where: { email } });
	}

	async update(id: string, input: UpdateUserInput): Promise<User | null> {
		const user = await this.findById(id);
		if (!user) {
			return null;
		}

		Object.assign(user, input);
		return this.repository.save(user);
	}
}