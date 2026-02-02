import amqp from 'amqplib';

const QUEUE_NAME = 'my-queue-02';

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

    // Declare the queue with durable: true to match the producer settings
    channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Only process one message at a time (fair dispatch)
    channel.prefetch(1);

    // Start consuming messages from the queue
    channel.consume(QUEUE_NAME, (message) => {
      // Simulate work time: each dot (.) in the message = 1 second delay
      // Example: "task..." will take 3 seconds to process
      const seconds = message.content.toString().split('.').length - 1;

      console.log(`Received ${message.content.toString()}`);

      // Simulate processing time, then acknowledge the message
      setTimeout(() => {
        console.log(`Done ${message.content.toString()}`);
        // Acknowledge: tells RabbitMQ this message was processed successfully
        channel.ack(message);
      }, seconds * 1000);
    }, {
      // noAck: false means we must manually acknowledge messages
      noAck: false,
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
