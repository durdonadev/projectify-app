// src/types/express.d.ts

import { RequestUser } from './base';

declare module 'express-serve-static-core' {
    interface Request {
        locals: {
            // This is always available in authenticated routes
            user: RequestUser;
        };
    }
}
