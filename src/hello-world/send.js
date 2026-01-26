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

    // Use a single string if your server doesn't require authentication
    // const connection = await amqp.connect(RABBITMQ_HOST);

    const channel = await connection.createChannel();

    // We declare a queue. Declaring a queue is idempotent, so it will only be created
    // if it doesn't exists.
    channel.assertQueue(QUEUE_NAME, {
      durable: false,
    });

    // We send a message to the queue.
    const message = `Message ${Date.now()}`;
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log(`Message sent: ${message}`);

    // We close the connection and exit.
    setTimeout(async () => {
      await connection.close();
      process.exit(0);
    }, 500);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
