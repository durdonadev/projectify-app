import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Roles } from '../types';

class Mailer {
    transporter: nodemailer.Transporter;
    baseUiURL: string | undefined;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_ADDRESS,
                pass: process.env.MAILER_PASS,
            },
        });
        this.baseUiURL = process.env.UI_BASE_URL;
    }
    send = async (mailOptions: Mail.Options) => {
        await this.transporter.sendMail(mailOptions);
    };

    sendActivationMail = async (emailAddress: string, token: string) => {
        await this.send({
            to: emailAddress,
            subject: 'Projectify App | Activate Your Account',
            html: `<a style="color: red;" href="${this.baseUiURL}/admin/activate-account?activationToken=${token}">Activate your account</a>`,
        });
    };

    sendPasswordResetToken = async (
        emailAddress: string,
        token: string,
        user: Roles,
    ) => {
        this.send({
            to: emailAddress,
            subject: 'Projectify App | Reset Password',
            html: `<a href="${this.baseUiURL}/${user}/reset-password?passwordResetToken=${token}">Reset Your Password</a>`,
        });
    };

    sendCreatePasswordInviteToTeamMember = async (
        emailAddress: string,
        token: string,
    ) => {
        await this.send({
            to: emailAddress,
            subject: 'Projectify App | Welcome to the team',
            html: `<a href="${this.baseUiURL}/team-member/create-password?inviteToken=${token}">Click to create a password</a>`,
        });
    };
}

export const mailer = new Mailer();
