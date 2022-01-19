import { Addons, Contributions, User, UserCreationParams, UserRepository } from '../interfaces';
import * as urf from "../repository/UserFirestormRepository";

export class UserService {

  private repository: UserRepository = new urf.default();

  public get(id: string): Promise<User> {
    return this.repository.getUserById(id);
  }

  public getUserById(id: string): Promise<User> {
    return this.get(id);
  }

  public getContributions(id: string): Promise<Contributions> {
    return this.repository.getContributionsById(id);
  }

  public getAddons(id: string): Promise<Addons> {
    return this.repository.getAddonsById(id);
  }
  
  //! We don't make verifications here, it's in the controllers
  
	public create(id: string, user: UserCreationParams): Promise<User> {
		return this.repository.create(id, user);
	}

	public async setRoles(id: string, roles: string[]) {
		const user = await this.getUserById(id);
    user.roles = roles
    return this.update(id, user);
	}

  public update(id: string, user: User): Promise<User> {
    return this.repository.update(id, user);
	}

  public delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}