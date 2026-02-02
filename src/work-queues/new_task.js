import amqp from 'amqplib';

const QUEUE_NAME = 'my-queue-02';

// Get message from command line args or use default
// Usage: node new_task.js "Your task message here"
const message = process.argv.slice(2).join(' ') || 'Hello World';

(async () => {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: 'localhost',
      username: 'admin',
      password: '4dm1n',
    });

    // Create a channel for communication
    const channel = await connection.createChannel();

    // Declare the queue with durable: true so it survives broker restarts
    channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Send the message with persistent: true so it's saved to disk
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true,
    });
    console.log(`Message sent: ${message}`);

    // Wait briefly for the message to be sent, then close connection
    setTimeout(async () => {
      await connection.close();
      process.exit(0);
    }, 500);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
