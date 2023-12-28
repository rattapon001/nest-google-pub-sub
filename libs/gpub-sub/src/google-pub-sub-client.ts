import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PubSubClientOptions } from './interface/pub-sub-config.interface';
import { Logger } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';

export declare enum Transport {
  GOOGLE_PUBSUB = 'GOOGLE_PUBSUB',
}

export class GoogleCloudPubSubClient extends ClientProxy {
  protected logger = new Logger(GoogleCloudPubSubClient.name);
  protected pubSub: PubSub;

  private options: PubSubClientOptions;

  constructor(options?: PubSubClientOptions) {
    super();
    this.options = options;
  }
  async connect(): Promise<any> {
    const isPubSubExist = this.pubSub !== undefined;
    if (isPubSubExist) {
      return;
    }

    this.pubSub = new PubSub(this.options.clientConfig);
    this.logger.log('Connected to Google Cloud PubSub');
  }

  async close() {
    if (this.pubSub !== undefined) {
      await this.pubSub.close();
      this.pubSub = undefined;
    }
    this.logger.log('Disconnected from Google Cloud PubSub');
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return console.log('event to dispatch: ', packet);
  }

  publish(packet: ReadPacket, callback: (packet: WritePacket<any>) => void) {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    setTimeout(() => callback({ response: packet.data }), 5000);

    return () => console.log('teardown');
  }
}
