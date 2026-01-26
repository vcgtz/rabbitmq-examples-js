# RabbitMQ Examples with Node.js

A collection of examples demonstrating how to use RabbitMQ with Node.js using the `amqplib` library.

## What is RabbitMQ?

RabbitMQ is an open-source message broker that enables applications to communicate with each other by sending and receiving messages through queues. It implements the Advanced Message Queuing Protocol (AMQP) and is widely used for:

- Decoupling application components
- Asynchronous processing
- Load balancing between workers
- Building event-driven architectures

## Prerequisites

- Node.js installed
- Docker and Docker Compose (for running RabbitMQ)

## Installation

```bash
npm install
```

## Running RabbitMQ

Start the RabbitMQ server using Docker:

```bash
docker-compose up -d
```

## Examples

| Example | Description |
|---------|-------------|
| [Hello World](src/hello-world/) | Basic producer/consumer pattern with a simple queue |

## License

MIT
