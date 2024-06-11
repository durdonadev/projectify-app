// src/types/express.d.ts

import { RequestUser } from './base';

declare module 'express-serve-static-core' {
    interface Request {
        locals: {
            user?: RequestUser;
        };
    }
}
