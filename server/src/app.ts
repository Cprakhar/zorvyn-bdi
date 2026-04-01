import express from "express";
import type { DataSource } from "typeorm";

export const createApp = (_dataSource: DataSource) => {
    const app = express();
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });

    return app;
};
