import type { NextFunction, Request, Response } from "express";
import { UserRole, type User } from "../entity/User";
import { UserRepo } from "../repo/UserRepo";
import { forbidden, unauthorized } from "./errors";

export interface AuthenticatedRequest extends Request {
    actor?: User;
}

export const authenticationMiddleware = (userRepo: UserRepo) => {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (req.path === "/health") {
            return next();
        }

        const userId = req.header("x-user-id")?.trim();
        const userEmail = req.header("x-user-email")?.trim();

        if (!userId && !userEmail) {
            return next(unauthorized("Provide x-user-id or x-user-email header"));
        }

        const actor = userId
            ? await userRepo.findById(userId)
            : await userRepo.findByEmail(String(userEmail));

        if (!actor) {
            return next(unauthorized("User not found"));
        }

        if (!actor.isActive) {
            return next(forbidden("Inactive users cannot access the API"));
        }

        req.actor = actor;
        return next();
    };
};

export const requireRoles = (...roles: UserRole[]) => {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.actor) {
            return next(unauthorized());
        }

        if (!roles.includes(req.actor.role)) {
            return next(forbidden("Insufficient permissions"));
        }

        return next();
    };
};
