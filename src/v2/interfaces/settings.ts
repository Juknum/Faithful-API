export interface SettingsRepository {
	getRaw(): Promise<Record<string, any>>;
	update(body: Record<string, any>): Promise<void>;
}
