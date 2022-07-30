import { Uses } from './uses';
import { KnownPacks, Texture, TextureMCMETA } from './textures';
import { Contributions } from './contributions';
import { Paths } from './paths';

export interface GalleryResult {
  name: string,
  pathID: string,
  tags: string[],
  textureID: string,
  mcmeta: TextureMCMETA,
  url: string,
  useID: string
}

export type AcceptedRes = "16x" | "32x" | "64x";

export interface GalleryModalResult {
  contributions: Contributions,
  texture: Texture,
  uses: Uses,
  paths: Paths,
  mcmeta: TextureMCMETA,
  urls: (KnownPacks | string)[]
}