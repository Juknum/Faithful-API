export interface SettingsRepository {
	getRaw(): Promise<any>;
	update(body: any): Promise<void>;
}
