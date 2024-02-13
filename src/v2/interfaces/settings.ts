import { WriteConfirmation } from "firestorm-db";

export interface SettingsRepository {
	getRaw(): Promise<Record<string, any>>;
	update(body: Record<string, any>): Promise<WriteConfirmation>;
}
