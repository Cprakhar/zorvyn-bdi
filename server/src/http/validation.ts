import { TransactionType } from "../entity/Transaction";
import { UserRole } from "../entity/User";
import { badRequest } from "./errors";

const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};

export const parseUserRole = (value: unknown): UserRole => {
    if (!isNonEmptyString(value)) {
        throw badRequest("role is required");
    }

    if (!Object.values(UserRole).includes(value as UserRole)) {
        throw badRequest("role must be one of: viewer, analyst, admin");
    }

    return value as UserRole;
};

export const parseTransactionType = (value: unknown): TransactionType => {
    if (!isNonEmptyString(value)) {
        throw badRequest("type is required");
    }

    if (!Object.values(TransactionType).includes(value as TransactionType)) {
        throw badRequest("type must be one of: income, expense");
    }

    return value as TransactionType;
};

export const parseEmail = (value: unknown): string => {
    if (!isNonEmptyString(value)) {
        throw badRequest("email is required");
    }

    const email = value.trim().toLowerCase();
    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmailRegex.test(email)) {
        throw badRequest("email is invalid");
    }

    return email;
};

export const parseName = (value: unknown): string => {
    if (!isNonEmptyString(value)) {
        throw badRequest("name is required");
    }

    return value.trim();
};

export const parseBoolean = (value: unknown, fallback: boolean): boolean => {
    if (value === undefined) {
        return fallback;
    }

    if (typeof value !== "boolean") {
        throw badRequest("boolean value expected");
    }

    return value;
};

export const parsePositiveInteger = (value: unknown, fieldName: string): number => {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        throw badRequest(`${fieldName} must be a positive integer`);
    }

    return value;
};

export const parseOptionalString = (value: unknown, fieldName: string): string | null | undefined => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (!isNonEmptyString(value)) {
        throw badRequest(`${fieldName} must be a non-empty string or null`);
    }

    return value.trim();
};

export const parseDate = (value: unknown, fieldName: string): Date => {
    if (!isNonEmptyString(value)) {
        throw badRequest(`${fieldName} is required and must be an ISO date string`);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw badRequest(`${fieldName} is not a valid date`);
    }

    return parsed;
};

export const parseOptionalDate = (value: unknown, fieldName: string): Date | undefined => {
    if (value === undefined) {
        return undefined;
    }

    return parseDate(value, fieldName);
};

export const parsePositiveIntFromQuery = (
    value: unknown,
    fieldName: string,
    defaultValue: number,
    max?: number
): number => {
    if (value === undefined) {
        return defaultValue;
    }

    if (typeof value !== "string" || value.trim().length === 0) {
        throw badRequest(`${fieldName} must be a positive integer`);
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw badRequest(`${fieldName} must be a positive integer`);
    }

    if (max !== undefined && parsed > max) {
        throw badRequest(`${fieldName} must be <= ${max}`);
    }

    return parsed;
};
