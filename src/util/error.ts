import type { IErrorWithMessage } from "../types";

export class ValidationError extends Error {
    value: unknown;

    constructor(message: string, value: unknown) {
        super(message);
        this.value = value;
    }

    toString(): string {
        if (this.value === undefined || this.value === null) {
            return `ValidationError: ${this.message}`;
        } else if (typeof this.value === "string") {
            return `ValidationError: ${this.message} (value: "${this.value}")`;
        } else {
            return `ValidationError: ${this.message} (value: ${JSON.stringify(this.value)})`;
        }
    }
}

export function parseError(error: unknown): IErrorWithMessage {
    let message: string;
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === "string") {
        message = error;
    } else if (error && typeof error === "object" && "message" in error) {
        message = (error as { message: string }).message;
    } else if (error && typeof error === "object" && "toString" in error) {
        message = (error as { toString: () => string }).toString();
    } else {
        message = JSON.stringify(error);
    }
    return {
        message,
        thrown: error
    };
}
