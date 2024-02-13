import { WriteConfirmation } from "firestorm-db";
import SettingsFirestormRepository from "../repository/firestorm/settings.repository";

export class SettingsService {
	private readonly settingsRepository = new SettingsFirestormRepository();

	raw(): Promise<Record<string, any>> {
		return this.settingsRepository.getRaw();
	}

	async get(keys: string[]): Promise<any> {
		const raw = await this.raw();

		let result = raw[keys[0]];
		let i = 1;
		while (i < keys.length && result !== undefined) {
			result = result[keys[i]];
			i += 1;
		}

		return result;
	}

	update(body: Record<string, any>): Promise<WriteConfirmation> {
		return this.settingsRepository.update(body);
	}
}
