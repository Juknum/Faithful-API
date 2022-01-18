import { users } from '../firestorm';
import { Contributions, User } from '../interfaces';

export default {
  get: function (id: string): Promise<User> {
    return users.get(id);
  },

  getContributions: function (id: string): Promise<Contributions> {
    return users.get(id).then(u => u.contributions());
  }

  // todo: implements setter with authentification verification
}