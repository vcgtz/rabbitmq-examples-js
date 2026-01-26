import amqp from 'amqplib';

const RABBITMQ_HOST = 'amqp://localhost';
const QUEUE_NAME = 'my-queue-01';

(async () => {
  try {
    // Establishing the connection to the RabbitMQ Server.
    // Here, we're using a username and a password.
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: 'localhost',
      username: 'admin',
      password: '4dm1n',
    });

    const channel = await connection.createChannel();

    // We declare a queue. Declaring a queue is idempotent, so it will only be created
    // if it doesn't exists.
    channel.assertQueue(QUEUE_NAME, {
      durable: false,
    });

    // We start listening the queue, when a messages arrives to the queue, the callback
    // will be executed.
    channel.consume(QUEUE_NAME, (message) => {
      console.log(`Message received: ${message.content.toString()}`);
    }, {
      noAck: true,
    });
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
})();
