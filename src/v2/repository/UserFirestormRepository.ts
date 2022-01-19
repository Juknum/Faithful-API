import { users } from '../firestorm'
import { Addons, Contributions, User, UserCreationParams, UserRepository } from '../interfaces';


function __tranformUser(user: any): User {
	return {
		id: user.id,
    username: user.username || '',
    uuid: user.uuid || '',
    roles: user.roles || user.type,
    media: user.media,
    warns: user.warns || [],
    muted: user.muted || {
      start: "0",
      end: "0",
    }
	}
}

export default class UserFirestormRepository implements UserRepository {
  getUserById(id: string): Promise<User> {
    return users.get(id)
      .then(u => __tranformUser(u))
      .catch(err => {
        if(err.isAxiosError && err.response.statusCode === 404) {
          let formattedError = new Error('User not found') as any;
          formattedError.code = 404
          Promise.reject(formattedError)

          return
        }

        return Promise.reject(err)
      });
  }
  getContributionsById(id: string): Promise<Contributions> {
    return users.get(id).then(u => u.contributions());
  }
  getAddonsById(id: string): Promise<Addons> {
    return users.get(id).then(u => u.addons());
  }
  create(id: string, user: UserCreationParams): Promise<User> {
		return this.update(id, user);
  }
  update(id: string, user: UserCreationParams): Promise<User> {
		return users.set(id, user);
  }
  delete(id: string): Promise<void> {
    return users.remove(id)
      .then(() => Promise.resolve())
  }
}