import "reflect-metadata";
import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import { User } from "./entity/User";

const dbPath = process.env.DB_PATH ?? "finance.sqlite";

export const AppDataSource = new DataSource({
    type: "sqljs",
    location: dbPath,
    autoSave: true,
    entities: [User, Transaction],
    synchronize: true,
    logging: false,
});
