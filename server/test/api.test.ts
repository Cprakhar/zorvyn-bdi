import request from "supertest";
import { DataSource } from "typeorm";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { Transaction, TransactionType } from "../src/entity/Transaction";
import { User, UserRole } from "../src/entity/User";
import { UserRepo } from "../src/repo/UserRepo";

let dataSource: DataSource;
let adminId = "";
let analystId = "";
let viewerId = "";

const initDataSource = async () => {
    dataSource = new DataSource({
        type: "sqljs",
        autoSave: false,
        entities: [User, Transaction],
        synchronize: true,
        dropSchema: true,
    });

    await dataSource.initialize();
};

beforeAll(async () => {
    await initDataSource();
});

afterAll(async () => {
    if (dataSource?.isInitialized) {
        await dataSource.destroy();
    }
});

beforeEach(async () => {
    await dataSource.synchronize(true);

    const userRepo = new UserRepo(dataSource);
    const admin = await userRepo.create({
        email: "admin@test.local",
        name: "Admin",
        role: UserRole.ADMIN,
    });
    const analyst = await userRepo.create({
        email: "analyst@test.local",
        name: "Analyst",
        role: UserRole.ANALYST,
    });
    const viewer = await userRepo.create({
        email: "viewer@test.local",
        name: "Viewer",
        role: UserRole.VIEWER,
    });

    adminId = admin.id;
    analystId = analyst.id;
    viewerId = viewer.id;
});

describe("API RBAC and finance behavior", () => {
    it("issues token and allows bearer-authenticated request", async () => {
        const app = createApp(dataSource);

        const tokenResponse = await request(app)
            .post("/auth/token")
            .send({ email: "analyst@test.local" });

        expect(tokenResponse.status).toBe(200);
        expect(typeof tokenResponse.body.accessToken).toBe("string");

        const listResponse = await request(app)
            .get("/transactions")
            .set("Authorization", `Bearer ${tokenResponse.body.accessToken}`);

        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body.items)).toBe(true);
    });

    it("blocks viewer from reading transactions", async () => {
        const app = createApp(dataSource);

        const response = await request(app)
            .get("/transactions")
            .set("x-user-id", viewerId);

        expect(response.status).toBe(403);
    });

    it("allows analyst to read transactions but not create", async () => {
        const app = createApp(dataSource);

        const listResponse = await request(app)
            .get("/transactions")
            .set("x-user-id", analystId);

        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body.items)).toBe(true);

        const createResponse = await request(app)
            .post("/transactions")
            .set("x-user-id", analystId)
            .send({
                amount: 1000,
                type: TransactionType.INCOME,
                category: "Salary",
                transactionDate: "2026-01-01T00:00:00.000Z",
            });

        expect(createResponse.status).toBe(403);
    });

    it("lets admin create transactions and returns dashboard summary", async () => {
        const app = createApp(dataSource);

        const incomeResponse = await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 5000,
                type: TransactionType.INCOME,
                category: "Salary",
                transactionDate: "2026-01-10T00:00:00.000Z",
            });

        expect(incomeResponse.status).toBe(201);

        const expenseResponse = await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 1200,
                type: TransactionType.EXPENSE,
                category: "Rent",
                transactionDate: "2026-01-11T00:00:00.000Z",
            });

        expect(expenseResponse.status).toBe(201);

        const summaryResponse = await request(app)
            .get("/dashboard/summary")
            .set("x-user-id", viewerId);

        expect(summaryResponse.status).toBe(200);
        expect(summaryResponse.body.totalIncome).toBe(5000);
        expect(summaryResponse.body.totalExpense).toBe(1200);
        expect(summaryResponse.body.netBalance).toBe(3800);
        expect(summaryResponse.body.categoryTotals[0].category).toBe("Salary");
    });

    it("filters transactions by type and category", async () => {
        const app = createApp(dataSource);

        await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 800,
                type: TransactionType.EXPENSE,
                category: "Food",
                transactionDate: "2026-02-01T00:00:00.000Z",
            });

        await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 4000,
                type: TransactionType.INCOME,
                category: "Bonus",
                transactionDate: "2026-02-02T00:00:00.000Z",
            });

        const filtered = await request(app)
            .get("/transactions?type=expense&category=Food&page=1&pageSize=5")
            .set("x-user-id", analystId);

        expect(filtered.status).toBe(200);
        expect(filtered.body.items).toHaveLength(1);
        expect(filtered.body.items[0].category).toBe("Food");
        expect(filtered.body.pagination.page).toBe(1);
        expect(filtered.body.pagination.pageSize).toBe(5);
    });

    it("filters transactions by search keyword", async () => {
        const app = createApp(dataSource);

        await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 1500,
                type: TransactionType.EXPENSE,
                category: "Transport",
                description: "Airport shuttle",
                transactionDate: "2026-02-03T00:00:00.000Z",
            });

        await request(app)
            .post("/transactions")
            .set("x-user-id", adminId)
            .send({
                amount: 3200,
                type: TransactionType.INCOME,
                category: "Consulting",
                description: "Client retainer",
                transactionDate: "2026-02-04T00:00:00.000Z",
            });

        const filtered = await request(app)
            .get("/transactions?search=shuttle&page=1&pageSize=10")
            .set("x-user-id", analystId);

        expect(filtered.status).toBe(200);
        expect(filtered.body.items).toHaveLength(1);
        expect(filtered.body.items[0].category).toBe("Transport");
    });

    it("serves api documentation", async () => {
        const app = createApp(dataSource);
        const docsResponse = await request(app).get("/docs-json");

        expect(docsResponse.status).toBe(200);
        expect(docsResponse.body.openapi).toBe("3.2.0");
    });
});
