import { AppDataSource } from "./data-source";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);

const start = async () => {
	await AppDataSource.initialize();
	const app = createApp(AppDataSource);
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
};

start().catch((error) => {
	console.error("Failed to start server", error);
	process.exit(1);
});