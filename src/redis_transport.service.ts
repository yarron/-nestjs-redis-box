import { Injectable } from '@nestjs/common';
import {
  ClientProviderOptions,
  ClientRedis,
  Transport,
} from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class RedisTransportService extends ClientRedis {
  constructor(options) {
    super(options);
  }

  static getProviderOptions = (options): ClientProviderOptions => ({
    name: 'REDIS',
    transport: Transport.REDIS,
    options,
  });

  sendPromise<T>(topicName: string, topicMessage: unknown): Promise<T> {
    return lastValueFrom(
      super
        .send(topicName, topicMessage)
        .pipe(timeout(10000))
        .pipe(
          catchError((error: Error) => {
            throw new Error(error?.message);
          }),
        ),
    );
  }

  async onApplicationBootstrap() {
    await super.connect();
  }

  async beforeApplicationShutdown() {
    await super.close();
  }
}
