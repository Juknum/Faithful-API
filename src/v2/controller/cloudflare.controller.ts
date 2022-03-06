import { Controller, Get, Route, Security, Tags } from "tsoa";
import CloudflareService from "../service/cloudflare.service";

@Route("cloudflare")
@Tags("Cloudflare")
export class CloudflareController extends Controller {
	private readonly service: CloudflareService = new CloudflareService();

	/**
	 * Purge the whole cache of cloudflare for the domain compliancepack.net, all sub-domains are affected too.
	 */
	@Get("purge")
	@Security("cloudflare")
	public async purge(): Promise<void> {
		return this.service.purge();
	}
}
