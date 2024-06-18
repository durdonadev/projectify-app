export class CustomError extends Error {
    statusCode: number;
    errorType: string;
    isOperational: boolean;
    details?: object;

    constructor(message: string, statusCode: number, details?: object) {
        super(message);
        this.statusCode = statusCode;
        this.errorType = statusCode.toString().startsWith('4')
            ? 'fail'
            : 'error';
        this.isOperational = true;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}
