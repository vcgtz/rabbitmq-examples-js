# Hello World Example

This example demonstrates the simplest RabbitMQ pattern: a producer sends messages to a queue, and a consumer receives them.

## Components

### Connection
The connection is the TCP connection between your application and the RabbitMQ broker. It handles authentication and provides the base for creating channels.

```javascript
const connection = await amqp.connect({
  protocol: 'amqp',
  hostname: 'localhost',
  username: 'admin',
  password: '4dm1n',
});
```

### Channel
A channel is a virtual connection inside the TCP connection. All operations (declaring queues, publishing messages, consuming messages) happen through channels. Using channels allows you to have multiple logical connections without opening multiple TCP connections.

```javascript
const channel = await connection.createChannel();
```

### Queue
A queue is a buffer that stores messages. Producers send messages to queues, and consumers receive messages from queues.

```javascript
channel.assertQueue(QUEUE_NAME, {
  durable: false,
});
```

The `assertQueue` method is idempotent: it will only create the queue if it doesn't already exist.

## Producer (send.js)

The producer connects to RabbitMQ, declares a queue, and sends a message.

```javascript
const message = `Message ${Date.now()}`;
channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
```

Messages must be sent as `Buffer` objects, so we convert the string using `Buffer.from()`.

## Consumer (receive.js)

The consumer connects to RabbitMQ, declares the same queue, and starts listening for messages.

```javascript
channel.consume(QUEUE_NAME, (message) => {
  console.log(`Message received: ${message.content.toString()}`);
}, {
  noAck: true,
});
```

The callback function is executed every time a message arrives in the queue.

## Running the Example

1. Start RabbitMQ (from the project root):
   ```bash
   docker-compose up -d
   ```

2. Start the consumer (in one terminal):
   ```bash
   node src/hello-world/receive.js
   ```

3. Send a message (in another terminal):
   ```bash
   node src/hello-world/send.js
   ```

## Important Options Explained

### `durable: false`

The `durable` option determines whether the queue survives a broker restart.

| Value | Behavior |
|-------|----------|
| `true` | The queue will be persisted to disk and will survive a RabbitMQ restart |
| `false` | The queue is stored in memory only and will be deleted if RabbitMQ restarts |

In this example, we use `durable: false` because it's a simple demonstration. In production, you typically want `durable: true` to ensure messages aren't lost if the server restarts.

**Note:** If you also want messages to survive a restart, you need to publish them with `{ persistent: true }`.

### `noAck: true`

The `noAck` (no acknowledgment) option controls how RabbitMQ handles message delivery confirmation.

| Value | Behavior |
|-------|----------|
| `true` | Messages are automatically acknowledged as soon as they are delivered. RabbitMQ removes the message from the queue immediately. |
| `false` | You must manually acknowledge messages using `channel.ack(message)`. The message stays in the queue until acknowledged. |

**When to use `noAck: true`:**
- Simple examples or testing
- When losing a message is acceptable
- When you prioritize speed over reliability

**When to use `noAck: false`:**
- Production environments
- When you need guaranteed message processing
- When you want to requeue messages if processing fails

Example with manual acknowledgment:
```javascript
channel.consume(QUEUE_NAME, (message) => {
  try {
    // Process the message
    console.log(`Message received: ${message.content.toString()}`);

    // Acknowledge the message after successful processing
    channel.ack(message);
  } catch (error) {
    // Reject and requeue the message if processing fails
    channel.nack(message, false, true);
  }
}, {
  noAck: false,
});
```

### `setTimeout` in send.js

```javascript
setTimeout(async () => {
  await connection.close();
  process.exit(0);
}, 500);
```

The `setTimeout` is used because `sendToQueue` is an asynchronous operation that doesn't return a promise. The method buffers the message and sends it in the background.

If we close the connection immediately after calling `sendToQueue`, the message might not have been fully transmitted yet. The 500ms delay gives RabbitMQ enough time to:

1. Transmit the message over the network
2. Receive confirmation from the broker
3. Flush any internal buffers

**Alternative approaches:**
- Use `channel.waitForConfirms()` with publisher confirms enabled
- Use `connection.close()` which waits for pending operations
