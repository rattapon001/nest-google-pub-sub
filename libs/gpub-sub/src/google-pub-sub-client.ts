import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PubSubClientOptions } from './interface/pub-sub-config.interface';
import { Logger } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';

export enum Transport {
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
    throw new Error('Method not implemented.');
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ) {
    const topic = this.pubSub.topic(packet.pattern);
    const dataBuffer = Buffer.from(JSON.stringify(packet.data));

    topic.publish(dataBuffer, undefined, (err) => {
      if (err) {
        return callback({ err });
      }
      callback({ response: packet.data });
    });
    return () => console.log('teardown');
  }

  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    throw new Error('Method not implemented.');
  }

  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    throw new Error('Method not implemented.');
  }
}
