import { Get, Route } from 'tsoa';
import * as collections from '../firestorm';
import { ErrorResponse } from '../tools/interfaces';

interface RawResponse {
  [key: string]: any;
}

@Route('raw')
export default class Raw {
  @Get('/:collection')
  public async getRawCollection(collection: string): Promise<RawResponse | ErrorResponse> {
    if (!collections[collection]) return { error: `This collection does not exist!` };
    return collections[collection].read_raw();
  }
}