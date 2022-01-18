import { Textures, Texture, Use, Uses, Path, Paths, Contributions, Contribution } from "~/v2/interfaces";

interface OldUses extends Array<OldUse> { }
interface OldUse {
  textureID: number;
  textureUseName: string;
  editions: Array<string>;
  id: string;
}

export function mapUses(data: OldUses): Uses { return data.map(mapUse); }
export function mapUse(old: OldUse): Use {
  return {
    id: old.id,
    name: old.textureUseName,
    edition: old.editions[0],
    assets: (old.editions[0] === 'java' ? 'minecraft' : null),
  } as Use;
}

interface OldTextures extends Array<OldTexture> { }
interface OldTexture {
  name: string;
  id: string;
  type: Array<string>
}

export function mapTextures(data: OldTextures): Textures { return data.map(mapTexture); }
export function mapTexture(old: OldTexture): Texture {
  return {
    id: old.id,
    name: old.name,
    tags: old.type
  } as Texture;
}

interface OldPaths extends Array<OldPath> { }
interface OldPath {
  useID: string;
  path: string;
  versions: Array<string>;
  id: string;
  mcmeta: boolean;
}

export function mapPaths(data: OldPaths): Paths { return data.map(mapPath) }
export function mapPath(old: OldPath): Path {
  return {
    id: old.id,
    use: old.useID,
    name: old.path.replace('assets/minecraft/', ''), // specified in the use
    mcmeta: old.mcmeta,
    versions: old.versions,
  }
}

interface OldContributions extends Array<OldContribution> { }
interface OldContribution {
  date: number;
  res: "c32" | "c64";
  textureID: number;
  contributors: Array<string>;
  id: string;
}

export function mapContributions(data: OldContributions): Contributions { return data.map(mapContribution) }
export function mapContribution(old: OldContribution): Contribution {
  return {
    id: old.id,
    date: old.date,
    texture: old.textureID.toString(),
    resolution: old.res === 'c32' ? '32x' : '64x',
    authors: old.contributors,
  }
}