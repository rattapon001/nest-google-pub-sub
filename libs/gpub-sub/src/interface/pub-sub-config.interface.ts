import { Transport } from '../google-pub-sub-client';

export interface PubSubConfig {
  projectId: string;
  keyFilename: string;
  debug?: boolean;
}

export interface PubSubServerOptions {
  serverConfig: PubSubConfig;
  subscriptions?: string[];
}

export interface PubSubClientOptions {
  transport: Transport;
  clientConfig: PubSubConfig;
}
