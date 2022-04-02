export type DevMode = 'on' | 'off'

export interface CloudflareRepository {
  purge(): Promise<any>
  dev(mode: DevMode): Promise<any>
}
