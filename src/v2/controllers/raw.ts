import { Get, Route } from 'tsoa';
import * as collections from '../firestorm';

interface RawResponse {
  [key: string]: any;
}

@Route('raw')
export default class Raw {
  @Get('/:collection')
  public async getRawCollection(collection: string): Promise<RawResponse> {
    if (!collections[collection]) return Promise.reject(
      new Error(`This collection does not exist! ${collections}`)
    )

    return collections[collection].read_raw();
  }
}