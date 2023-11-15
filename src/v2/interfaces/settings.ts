export interface SettingsRepository {
	getRaw(): Promise<Record<string, any>>;
	update(body: any): Promise<void>;
}
