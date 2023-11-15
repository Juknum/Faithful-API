import { settings } from "../../firestorm/index";
import { SettingsRepository } from "../../interfaces";

export default class SettingsFirestormRepository implements SettingsRepository {
	getRaw(): Promise<Record<string, any>> {
		return settings.read_raw();
	}

	update(body: any): Promise<void> {
		return settings.write_raw(body).then(() => {});
	}
}
