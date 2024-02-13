import { DevMode } from "../interfaces/cloudflare";
import CloudflareClassRepository from "../repository/cloudflare.repository";

export default class CloudflareService {
	private readonly repository = new CloudflareClassRepository();

	purge() {
		return this.repository.purge();
	}

	dev(mode: DevMode): Promise<void> {
		return this.repository.dev(mode);
	}
}
