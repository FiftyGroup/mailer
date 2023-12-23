import { Consumer } from "./consumer";
import {connect} from "amqplib"
import {config} from "dotenv"
import { emailService } from "./transporter";
const init = async () => {
            try{
            config()
            const connection = await  connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672")
            const channel = await connection.createConfirmChannel();
            const exchanges = ["ACCOUNT_CREATED", "RECOVERY_PASSWORD"];
    
            for (const e of exchanges) {
            await channel.assertExchange(e, "fanout", { durable: true });
            console.log(e, " exchange Criada!")
            }
    
    
            const consumer = await new Consumer("MAIL",["ACCOUNT_CREATED","RECOVERY_PASSWORD"]).start(connection)
            console.log("Consumer iniciado!")
            consumer.listen(async(response:any) => {
                if (response.type === "ACCOUNT_CREATED") {
                    console.log("Conta criada")
                    console.log("Dados da conta:", response.data)
                    // Implemente o envio de email aqui
                    // Exemplo : await emailService.send({body:"Bem vindo!",subject:"Confirme seu email",to:data.email})
                }
            })
        }catch(e){
            console.log(e)
        }

    
      

}

init()