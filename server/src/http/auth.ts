import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole, type User } from "../entity/User";
import { UserRepo } from "../repo/UserRepo";
import { forbidden, unauthorized } from "./errors";

export interface AuthenticatedRequest extends Request {
    actor?: User;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-local-secret";
export const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "12h";

export const issueAccessToken = (user: User): string => {
    const signOptions: jwt.SignOptions = {
        subject: user.id,
        expiresIn: TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign({ role: user.role, email: user.email }, JWT_SECRET, signOptions);
};

export const authenticationMiddleware = (userRepo: UserRepo) => {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (req.path === "/health" || req.path === "/auth/token" || req.path.startsWith("/docs")) {
            return next();
        }

        const authorization = req.header("authorization")?.trim();
        if (authorization?.startsWith("Bearer ")) {
            const token = authorization.slice("Bearer ".length).trim();
            try {
                const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
                const subject = payload.sub;
                if (!subject) {
                    return next(unauthorized("Invalid token subject"));
                }

                const actor = await userRepo.findById(subject);
                if (!actor) {
                    return next(unauthorized("User not found for token"));
                }

                if (!actor.isActive) {
                    return next(forbidden("Inactive users cannot access the API"));
                }

                req.actor = actor;
                return next();
            } catch {
                return next(unauthorized("Invalid or expired token"));
            }
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
