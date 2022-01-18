import { users } from '../firestorm';
import { Addons, Contributions, User } from '../interfaces';

export default {
  get: function (id: string): Promise<User> {
    return users.get(id);
  },

  getContributions: function (id: string): Promise<Contributions> {
    return users.get(id).then(u => u.contributions());
  },

  getAddons: function (id: string): Promise<Addons> {
    return users.get(id).then(u => u.addons());
  }

  // todo: implements setter with authentification verification
}