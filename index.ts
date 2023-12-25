import { Consumer } from "./consumer";
import { connect } from "amqplib";
import { config } from "dotenv";
import { emailService } from "./transporter";

const sendEmail = async (body: string, subject: string, to: string) => {
  const emailOptions = {body, subject, to};

  await emailService.send(emailOptions);
};

const init = async () => {
  try {
    config();
    const connection = await connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
    const channel = await connection.createConfirmChannel();
    const exchanges = ["ACCOUNT_CREATED", "RECOVERY_PASSWORD"];

    for (const e of exchanges) {
      await channel.assertExchange(e, "fanout", { durable: true });
    }

    const consumer = await new Consumer("MAIL", ["ACCOUNT_CREATED", "RECOVERY_PASSWORD",]).start(connection);

    consumer.listen(async (response: any) => {
      switch (response.type) {
        case "ACCOUNT_CREATED":
          await sendEmail("Bem-vindo!", "Confirme seu e-mail", response.data.email);
          break;
        case "RECOVERY_PASSWORD":
          await sendEmail("Recuperação de senha", "Recupere sua senha", response.data.email);
          break;
        default:
          break;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

init();
