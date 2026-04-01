export const openApiDocument = {
    openapi: "3.2.0",
    info: {
        title: "Finance Dashboard Backend API",
        version: "1.0.0",
        description: "Role-based finance records API with dashboard summaries.",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            AuthTokenResponse: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    tokenType: { type: "string", example: "Bearer" },
                    expiresIn: { type: "string", example: "12h" },
                    user: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            email: { type: "string" },
                            role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                        },
                    },
                },
            },
            TransactionInput: {
                type: "object",
                required: ["amount", "type", "category", "transactionDate"],
                properties: {
                    amount: { type: "integer", minimum: 1 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string" },
                    transactionDate: { type: "string", format: "date-time" },
                    description: { type: "string", nullable: true },
                },
            },
            PaginatedTransactions: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: { type: "object" },
                    },
                    pagination: {
                        type: "object",
                        properties: {
                            page: { type: "integer" },
                            pageSize: { type: "integer" },
                            totalItems: { type: "integer" },
                            totalPages: { type: "integer" },
                        },
                    },
                },
            },
        },
    },
    paths: {
        "/auth/token": {
            post: {
                summary: "Issue JWT token by user email",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Token issued",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/transactions": {
            get: {
                security: [{ bearerAuth: [] }],
                summary: "List transactions with filters and pagination",
                parameters: [
                    { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
                    { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
                ],
                responses: {
                    "200": {
                        description: "Paginated transactions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/PaginatedTransactions" },
                            },
                        },
                    },
                },
            },
            post: {
                security: [{ bearerAuth: [] }],
                summary: "Create transaction",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/TransactionInput" },
                        },
                    },
                },
                responses: {
                    "201": { description: "Created" },
                },
            },
        },
        "/dashboard/summary": {
            get: {
                security: [{ bearerAuth: [] }],
                summary: "Get dashboard summary",
                responses: {
                    "200": { description: "Summary object" },
                },
            },
        },
    },
} as const;
