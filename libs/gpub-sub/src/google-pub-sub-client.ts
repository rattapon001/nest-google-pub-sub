import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { PubSubClientOptions } from './interface/pub-sub-config.interface';
import { Logger } from '@nestjs/common';
import { PubSub, Topic } from '@google-cloud/pubsub';

export enum Transport {
  GOOGLE_PUBSUB = 'GOOGLE_PUBSUB',
}

export class GoogleCloudPubSubClient extends ClientProxy {
  protected logger = new Logger(GoogleCloudPubSubClient.name);
  protected pubSub: PubSub;
  private options: PubSubClientOptions;
  private project: string;

  constructor(options?: PubSubClientOptions) {
    super();
    this.options = options;
    this.project = 'projects/' + this.options.clientConfig.projectId;
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

  private async getTopicOrCreate(pattern: string) {
    const topicName = this.project + '/topics/' + pattern;
    const topic = this.pubSub.topic(topicName);
    const [exists] = await topic.exists();
    if (!exists) {
      await topic.create();
      await topic.createSubscription(pattern);
    }
    return topic;
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ) {
    const publishMessage = async (topic: Topic) => {
      const dataBuffer = Buffer.from(JSON.stringify(packet.data));
      topic.publish(dataBuffer, undefined, (err: any) => {
        if (err) {
          return callback({ err });
        }
      });
    };

    const topicPromise = this.getTopicOrCreate(packet.pattern);

    topicPromise.then(publishMessage).catch((error) => {
      console.error('Error publishing message:', error);
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
