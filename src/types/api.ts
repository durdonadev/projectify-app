import { TaskStatus } from '@prisma/client';

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface ForgetPasswordRequestBody {
    email: string;
}

export interface ResetPasswordRequestBody {
    password: string;
    passwordConfirm: string;
}

export interface AdminActivationQuery {
    activationToken: string;
}
export interface AdminCreateTaskRequestBody {
    title: string;
    description?: string;
    due: Date;
}

export interface AdminTaskByIdRequestParams {
    taskId: string;
}

export interface AdminUpdateTaskRequestBody {
    title?: string;
    description?: string;
    due?: Date;
    status?: TaskStatus;
}
