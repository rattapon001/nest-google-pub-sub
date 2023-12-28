import { Transport } from '../google-pub-sub-client';

export interface PubSubConfig {
  projectId: string;
  keyFilename: string;
}

export interface ClientOptions {
  transport: Transport;
  options?: PubSubClientOptions;
}

export interface PubSubClientOptions {
  clientConfig: PubSubConfig;
}
