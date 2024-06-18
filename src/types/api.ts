import {
    ContributorStatus,
    Prisma,
    ProjectStatus,
    TaskStatus,
} from '@prisma/client';
import * as core from 'express-serve-static-core';

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

export interface AdminTaskByIdRequestParams extends core.ParamsDictionary {
    taskId: string;
}

export interface AdminUpdateTaskRequestBody {
    title?: string;
    description?: string;
    due?: Date;
    status?: TaskStatus;
}

export interface TeamMemberCreatePasswordRequestBody {
    password: string;
    passwordConfirm: string;
    email: string;
}

export interface AdminTeamMemberByIdRequestParams
    extends core.ParamsDictionary {
    id: string;
}

export type AdminUpdateTeamMemberRequestBody = Pick<
    Prisma.TeamMemberUpdateInput,
    'firstName' | 'lastName' | 'position' | 'joinDate'
>;

export interface AdminProjectByIdRequestParams extends core.ParamsDictionary {
    id: string;
}

export type AdminUpdateProjectRequestBody = Pick<
    Prisma.ProjectUpdateInput,
    'name' | 'description' | 'startDate' | 'endDate'
>;

export interface AdminChangeProjectStatusRequestBody {
    status: ProjectStatus;
}

export interface AdminAddContributorToProjectRequestBody {
    teamMemberId: string;
}

export interface AdminChangeContributorStatusRequestParams
    extends AdminProjectByIdRequestParams {
    teamMemberId: string;
}

export interface AdminChangeContributorStatusRequestBody {
    status: ContributorStatus;
}
