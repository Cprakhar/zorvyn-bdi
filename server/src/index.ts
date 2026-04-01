import { AppDataSource } from "./data-source";
import { createApp } from "./app";
import { UserRole } from "./entity/User";
import { UserRepo } from "./repo/UserRepo";

const port = Number(process.env.PORT ?? 3000);

const start = async () => {
	await AppDataSource.initialize();

	const userRepo = new UserRepo(AppDataSource);
	const users = await userRepo.list();
	if (users.length === 0) {
		await userRepo.create({
			email: "admin@finance.local",
			name: "Default Admin",
			role: UserRole.ADMIN,
			isActive: true,
		});
		console.log("Seeded default admin user: admin@finance.local");
	}

	const app = createApp(AppDataSource);
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
};

start().catch((error) => {
	console.error("Failed to start server", error);
	process.exit(1);
});