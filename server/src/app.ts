import express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import type { DataSource } from "typeorm";
import { openApiDocument } from "./docs/openapi";
import { TransactionType } from "./entity/Transaction";
import { UserRole } from "./entity/User";
import {
    authenticationMiddleware,
    issueAccessToken,
    requireRoles,
    TOKEN_EXPIRES_IN,
    type AuthenticatedRequest,
} from "./http/auth";
import { badRequest, conflict, HttpError, notFound } from "./http/errors";
import {
    parseBoolean,
    parseDate,
    parseEmail,
    parseName,
    parseOptionalDate,
    parseOptionalString,
    parsePositiveIntFromQuery,
    parsePositiveInteger,
    parseTransactionType,
    parseUserRole,
} from "./http/validation";
import { TransactionRepo } from "./repo/TransactionRepo";
import { UserRepo } from "./repo/UserRepo";

export const createApp = (dataSource: DataSource) => {
    const app = express();
    const userRepo = new UserRepo(dataSource);
    const transactionRepo = new TransactionRepo(dataSource);
    const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";
    const globalRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    });
    const authRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
    });
    const writeRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(express.json());
    app.use((req, res, next) => {
        const origin = req.header("origin");

        if (origin && (allowedOrigin === "*" || origin === allowedOrigin)) {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Vary", "Origin");
        }

        res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-User-Id,X-User-Email");

        if (req.method === "OPTIONS") {
            return res.status(204).send();
        }

        return next();
    });
    app.use(globalRateLimit);

    app.get("/docs-json", (_req, res) => {
        res.status(200).json(openApiDocument);
    });
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

    app.post("/auth/token", authRateLimit, async (req, res, next) => {
        try {
            const email = parseEmail(req.body?.email);
            const user = await userRepo.findByEmail(email);
            if (!user) {
                throw notFound("User not found");
            }
            if (!user.isActive) {
                throw badRequest("User is inactive");
            }

            const accessToken = issueAccessToken(user);
            res.status(200).json({
                accessToken,
                tokenType: "Bearer",
                expiresIn: TOKEN_EXPIRES_IN,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    });

    app.use(authenticationMiddleware(userRepo));

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });

    app.get("/users", requireRoles(UserRole.ADMIN), async (_req, res, next) => {
        try {
            const users = await userRepo.list();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    });

    app.post("/users", writeRateLimit, requireRoles(UserRole.ADMIN), async (req, res, next) => {
        try {
            const email = parseEmail(req.body?.email);
            const name = parseName(req.body?.name);
            const role = parseUserRole(req.body?.role);
            const isActive = parseBoolean(req.body?.isActive, true);

            const existing = await userRepo.findByEmail(email);
            if (existing) {
                throw conflict("email already exists");
            }

            const user = await userRepo.create({ email, name, role, isActive });
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    });
    app.patch("/users/:id", writeRateLimit, requireRoles(UserRole.ADMIN), async (req, res, next) => {
        try {
            const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const payload = req.body ?? {};
            const update: {
                email?: string;
                name?: string;
                role?: UserRole;
                isActive?: boolean;
            } = {};

            if (payload.email !== undefined) {
                update.email = parseEmail(payload.email);
                const existing = await userRepo.findByEmail(update.email);
                if (existing && existing.id !== userId) {
                    throw conflict("email already exists");
                }
            }

            if (payload.name !== undefined) {
                update.name = parseName(payload.name);
            }

            if (payload.role !== undefined) {
                update.role = parseUserRole(payload.role);
            }

            if (payload.isActive !== undefined) {
                update.isActive = parseBoolean(payload.isActive, true);
            }

            if (Object.keys(update).length === 0) {
                throw badRequest("No valid fields provided for update");
            }

            const user = await userRepo.update(userId, update);
            if (!user) {
                throw notFound("User not found");
            }

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    });

    app.get(
        "/transactions",
        requireRoles(UserRole.ANALYST, UserRole.ADMIN),
        async (req, res, next) => {
            try {
                const typeParam = req.query.type;
                const categoryParam = req.query.category;
                const searchParam = req.query.search;
                const startDateParam = req.query.startDate;
                const endDateParam = req.query.endDate;
                const pageParam = req.query.page;
                const pageSizeParam = req.query.pageSize;

                const transactions = await transactionRepo.list({
                    type:
                        typeof typeParam === "string"
                            ? parseTransactionType(typeParam)
                            : undefined,
                    category: typeof categoryParam === "string" ? categoryParam : undefined,
                    search: typeof searchParam === "string" ? searchParam.trim() || undefined : undefined,
                    startDate:
                        typeof startDateParam === "string"
                            ? parseOptionalDate(startDateParam, "startDate")
                            : undefined,
                    endDate:
                        typeof endDateParam === "string"
                            ? parseOptionalDate(endDateParam, "endDate")
                            : undefined,
                    page:
                        typeof pageParam === "string"
                            ? parsePositiveIntFromQuery(pageParam, "page", 1)
                            : 1,
                    pageSize:
                        typeof pageSizeParam === "string"
                            ? parsePositiveIntFromQuery(pageSizeParam, "pageSize", 20, 100)
                            : 20,
                });

                res.status(200).json(transactions);
            } catch (error) {
                next(error);
            }
        }
    );
    app.post("/transactions", writeRateLimit, requireRoles(UserRole.ADMIN), async (req: AuthenticatedRequest, res, next) => {
        try {
            const amount = parsePositiveInteger(req.body?.amount, "amount");
            const type = parseTransactionType(req.body?.type);
            const category = parseName(req.body?.category);
            const transactionDate = parseDate(req.body?.transactionDate, "transactionDate");
            const description = parseOptionalString(req.body?.description, "description");

            if (!req.actor) {
                throw badRequest("Authenticated actor missing");
            }

            const transaction = await transactionRepo.create({
                amount,
                type,
                category,
                transactionDate,
                description,
                createdById: req.actor.id,
            });

            res.status(201).json(transaction);
        } catch (error) {
            next(error);
        }
    });

    app.patch(
        "/transactions/:id",
        writeRateLimit,
        requireRoles(UserRole.ADMIN),
        async (req: AuthenticatedRequest, res, next) => {
            try {
                const transactionId = Array.isArray(req.params.id)
                    ? req.params.id[0]
                    : req.params.id;
                const payload = req.body ?? {};
                const update: {
                    amount?: number;
                    type?: TransactionType;
                    category?: string;
                    transactionDate?: Date;
                    description?: string | null;
                } = {};

                if (payload.amount !== undefined) {
                    update.amount = parsePositiveInteger(payload.amount, "amount");
                }

                if (payload.type !== undefined) {
                    update.type = parseTransactionType(payload.type);
                }

                if (payload.category !== undefined) {
                    update.category = parseName(payload.category);
                }

                if (payload.transactionDate !== undefined) {
                    update.transactionDate = parseDate(payload.transactionDate, "transactionDate");
                }

                if (payload.description !== undefined) {
                    update.description = parseOptionalString(payload.description, "description");
                }

                if (Object.keys(update).length === 0) {
                    throw badRequest("No valid fields provided for update");
                }

                const transaction = await transactionRepo.update(transactionId, update);
                if (!transaction) {
                    throw notFound("Transaction not found");
                }

                res.status(200).json(transaction);
            } catch (error) {
                next(error);
            }
        }
    );

    app.delete(
        "/transactions/:id",
        writeRateLimit,
        requireRoles(UserRole.ADMIN),
        async (req, res, next) => {
            try {
                const transactionId = Array.isArray(req.params.id)
                    ? req.params.id[0]
                    : req.params.id;
                const deleted = await transactionRepo.remove(transactionId);
                if (!deleted) {
                    throw notFound("Transaction not found");
                }

                res.status(204).send();
            } catch (error) {
                next(error);
            }
        }
    );

    app.get(
        "/dashboard/summary",
        requireRoles(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN),
        async (_req, res, next) => {
            try {
                const summary = await transactionRepo.summarize();
                res.status(200).json(summary);
            } catch (error) {
                next(error);
            }
        }
    );

    app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                error: error.message,
                details: error.details,
            });
        }

        console.error("Unhandled error", error);
        return res.status(500).json({ error: "Internal server error" });
    });

    return app;
};
