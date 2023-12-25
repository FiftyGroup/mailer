import nodemailer, { Transporter } from "nodemailer";
import { config } from "dotenv";

config();

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
    }
    });
  }

  async send(params: IMailerServiceParams): Promise<void> {
    const { to, subject, body } = params;

    const mailOptions = {
      from: `${process.env.DISPLAY_NAME} <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text: body,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
interface IMailerServiceParams {
  to: string;
  subject: string;
  body: string;
}
export const emailService = new EmailService();