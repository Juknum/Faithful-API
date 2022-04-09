import { DevMode } from "../interfaces/cloudflare"
import CloudflareClassRepository from '../repository/cloudflare.repository'

export default class CloudflareService {
	private readonly repository: CloudflareClassRepository = new CloudflareClassRepository()

	purge() {
		return this.repository.purge()
	}

	dev(mode: DevMode): any | PromiseLike<any> {
		return this.repository.dev(mode)
	}
}
