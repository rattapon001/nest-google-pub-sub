# NestJS Microservice Connection with Google Cloud Pub/Sub

This README provides information on how to connect your NestJS application to Google Cloud Pub/Sub using the `connectMicroservice` method with a strategy based on `GoogleCloudPubSubServer`. Additionally, it includes information on registering the Google Cloud Pub/Sub client using the `ClientsModule`. This enables communication between microservices in your NestJS application.

## Getting Started

### Installation

1. Install the necessary dependencies:

   ```bash
   npm install
   ```

### Configuration

Configure your Google Cloud Pub/Sub server by providing the necessary configuration options. Replace the placeholder values with your actual configuration:

```typescript
const pubsubConfig = {
  projectId: 'your-project-id',
  keyFilename: 'path/to/your/keyfile.json',
  // Add other necessary configuration options
};
```

Connect the NestJS microservice using the configured Google Cloud Pub/Sub server:

```typescript
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YourAppModule,
    {
      strategy: new GoogleCloudPubSubServer({
        serverConfig: pubsubConfig,
      }),
    },
  );
}
bootstrap();
```

Register the Google Cloud Pub/Sub client using the `ClientsModule`:

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PUB_SUB_SERVICE',
        customClass: GoogleCloudPubSubClient,
        options: {
          clientConfig: pubsubConfig,
          transport: Transport.GOOGLE_PUBSUB,
        },
      },
    ]),
  ],
})
export class YourAppModule {}
```
