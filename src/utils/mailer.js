import nodemailer from "nodemailer";

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILER_ADDRESS,
                pass: process.env.MAILER_PASS
            }
        });
        this.baseApiURL =
            process.env.NODE_ENV === "local"
                ? "http://localhost:4000"
                : "https://projectify-app-api-express.onrender.com";
        this.baseUiURL = process.env.FRONT_URL;
    }

    send = async (mailOptions) => {
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw error;
        }
    };

    sendActivationMail = async (emailAddress, token) => {
        try {
            await this.send({
                to: emailAddress,
                subject: "Projectify App | Activate Your Account",
                html: `<a href="${this.baseApiURL}/admins/activate?activationToken=${token}">Verify your email</a>`
            });
        } catch (error) {
            throw error;
        }
    };

    sendPasswordResetToken = async (emailAddress, token) => {
        try {
            this.send({
                to: emailAddress,
                subject: "Projectify App | Reset Password",
                html: `<a href="${this.baseUiURL}/reset-password/passwordResetToken=${token}">Reset Your Password</a>`
            });
        } catch (error) {
            throw error;
        }
    };

    sendCreatePasswordInviteToTeamMember = async (emailAddress, token) => {
        try {
            await this.send({
                to: emailAddress,
                subject: "Projectify App | Welcome to the team",
                html: `<a href="${this.baseUiURL}/team-member/create-password?inviteToken=${token}">Click to create a password</a>`
            });
        } catch (error) {
            throw error;
        }
    };
}

export const mailer = new Mailer();
