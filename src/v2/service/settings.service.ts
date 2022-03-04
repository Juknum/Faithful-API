import { SettingsRepository } from '../interfaces/settings';
import SettingsFirestormRepository from '../repository/firestorm/settings.repository';

export class SettingsService {
  private readonly settingsRepository: SettingsRepository = new SettingsFirestormRepository();

  raw(): Promise<any> {
    return this.settingsRepository.getRaw();
  }

  async get(keys: string[]): Promise<any> {
    const raw = await this.raw();

    let result = raw[keys[0]];
    let i = 1;
    while (i < keys.length && result !== undefined) {
      result = result[keys[i]];
      i++;
    }

    return result;
  }

  update(body: any): void | PromiseLike<void> {
    return this.settingsRepository.update(body);
  }
}
