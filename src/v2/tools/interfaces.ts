export interface ErrorResponse {
  error: string
}

export interface TexturesAllResponse extends Array<TextureAllResponse> { }
export interface TextureAllResponse extends TextureResponse {
  uses: UsesResponse,
  paths: PathsResponse,
  contributions: ContributionsResponse
}

export interface TexturesResponse extends Array<TextureResponse> { }
export interface TextureResponse {
  name: string | number,      // texture name
  tags: Array<string>         // texture tags (block, item...)
}

export interface UsesResponse extends Array<UseResponse> { }
export interface UseResponse {
  name: string,               // use name
  texture: number,            // texture id
  edition: string,            // game edition
  assets: string              // assets folder name (empty for bedrock)
}

export interface PathsResponse extends Array<PathResponse> { }
export interface PathResponse {
  name: string,               // texture path ('textures/block/stone.png')
  use: string,                // use id
  versions: Array<string>,    // MC versions
  mcmeta: boolean             // true if animated
}

export interface ContributionsResponse extends Array<ContributionResponse> { }
export interface ContributionResponse {
  date: number,               // unix timestamp
  resolution: '32x' | '64x',  // texture resolution
  authors: Array<string>,     // discords users ids
  texture: string             // texture id
}

export interface UsersResponse extends Array<UserResponse> { }
export interface UserResponse {
  username: string,           // username displayed online
  roles: Array<string>        // discord roles the use have
  uuid: string,               // MC UUID
  muted: {
    start: string,            // unix timestamp of the beginning of the mute
    end: string,              // unix timestamp of the end of the mute
  },
  warns: Array<string>        // list of all warns
}
