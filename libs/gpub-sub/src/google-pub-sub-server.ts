import { PubSub, Subscription } from '@google-cloud/pubsub';
import { Server, CustomTransportStrategy } from '@nestjs/microservices';
// import { pubsubConfig } from 'src/config/pub-sub.config';

export class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  private readonly pubSub: PubSub;
  private subscriptions: Subscription[] = []; // Type should be Subscription from '@google-cloud/pubsub'

  constructor(private readonly options: any) {
    super();
    this.pubSub = new PubSub(options);
  }

  async getAllSubscription() {
    const subscriptionNames: string[] = [];
    const topic = await this.pubSub.getTopics();
    for (const t of topic[0]) {
      const subscription = await t.getSubscriptions();
      for (const s of subscription[0]) {
        subscriptionNames.push(s.name);
      }
    }

    return subscriptionNames;
  }

  public async listen(callback: () => void) {
    const subscriptionNames = await this.getAllSubscription();

    this.subscriptions = subscriptionNames.map((subscriptionName) => {
      const subscription = this.pubSub.subscription(subscriptionName);

      // // Handle incoming messages
      subscription.on('message', (message) =>
        this.handleMessage(message, subscriptionName),
      );

      // // Start listening for messages
      subscription.on('error', (err: Error) => {
        console.error(`Error with subscription ${subscriptionName}:`, err);
      });

      return subscription;
    });

    callback();
  }

  private handleMessage(message: any, subscription: string) {
    // // Handle incoming message
    const data = JSON.parse(message.data.toString());

    // // Emit the message to the appropriate pattern
    this.handleEvent(
      subscription,
      {
        pattern: subscription,
        data: data,
      },
      null,
    );
    // Acknowledge the message to mark it as processed
    message.ack();
  }

  public close() {
    this.subscriptions.forEach((subscription) => {
      subscription.removeAllListeners('message');
      subscription.removeAllListeners('error');
      subscription.close();
    });
  }
}
