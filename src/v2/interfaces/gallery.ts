export interface GalleryResult {
  name: string,
  pathID: string,
  tags: string[],
  textureID: string,
  url: string,
  useID: string
}

export type AcceptedRes = "16x" | "32x" | "64x";