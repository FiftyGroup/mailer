import { Connection, ConfirmChannel, ConsumeMessage } from "amqplib";

export class Consumer {
  private channel!: ConfirmChannel;
  private queue: string;
  private exchanges: string[]
  constructor(queue: string,exchanges:string[]) {
    this.queue = queue;
    this.exchanges = exchanges
  }

  async start(connection: Connection) {
    this.channel = await connection.createConfirmChannel();
    await this.channel.assertQueue(this.queue, { durable: true });
    this.exchanges.forEach(async(e) =>await this.channel.bindQueue(this.queue, e, ""))
    return this;
  }

  async listen(cb: (data: any) => Promise<void>) {
    return this.channel.consume(
      this.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }
        try {
          const data = JSON.parse(msg.content.toString());
          await cb(data);
          this.channel.ack(msg);
        } catch (e) {
          console.error(e);
        }
      }
    );
  }
}