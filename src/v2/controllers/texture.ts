import { Get, Route } from 'tsoa';
import { textures } from '../firestorm';
import { ErrorResponse, TextureResponse, UsesResponse, PathsResponse, ContributionsResponse, TextureAllResponse } from '../tools/interfaces';

@Route('texture')
export default class Texture {
  @Get('/:id')
  public async getId(id: string | number): Promise<TextureResponse | ErrorResponse> {
    if (!id) return { error: 'A textutre ID is required to proceed!' };
    if (isNaN(id as number) || id < 0) return { error: 'The texture ID must be a number/string > 0!' };

    return textures.get(id)
  }

  @Get('/:id/:type')
  public async getType(id: string | number, type: string): Promise<UsesResponse | TextureAllResponse | ContributionsResponse | PathsResponse | ErrorResponse> {
    if (!id) return { error: 'A textutre ID is required to proceed!' };
    if (isNaN(id as number) || id < 0) return { error: 'The texture ID must be a number/string > 0!' };

    switch (type) {
      case 'all':
        return (textures.get(id).then(t => t.all()) as TextureAllResponse);
      case 'uses':
        return (textures.get(id).then(t => t.uses()) as UsesResponse);
      case 'paths':
        return (textures.get(id).then(t => t.paths()) as PathsResponse);
      case 'contributions':
        return (textures.get(id).then(t => t.contributions()) as ContributionsResponse);

      default:
        return { error: 'This type is invalid!' };
    }
  }
}