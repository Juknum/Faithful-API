import { WriteConfirmation } from "firestorm-db";
import { settings } from "../../firestorm/index";
import { SettingsRepository } from "../../interfaces";

export default class SettingsFirestormRepository implements SettingsRepository {
	getRaw(): Promise<Record<string, any>> {
		return settings.readRaw();
	}

	update(body: Record<string, any>): Promise<WriteConfirmation> {
		return settings.writeRaw(body);
	}
}
