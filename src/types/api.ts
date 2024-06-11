export interface Login {
    email: string;
    password: string;
}

export interface AdminActivationQuery extends qs.ParsedQs {
    activationToken: string;
}
