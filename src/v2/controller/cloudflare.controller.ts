import { Controller, Get, Path, Route, Security, Tags } from "tsoa";
import { DevMode } from "../interfaces/cloudflare";
import CloudflareService from "../service/cloudflare.service";

@Route("cloudflare")
@Tags("Cloudflare")
export class CloudflareController extends Controller {
	private readonly service: CloudflareService = new CloudflareService();

	/**
	 * Purge the whole cache of cloudflare for the domain faithfulpack.net, all sub-domains are affected too.
	 */
	@Get("purge")
	@Security("cloudflare")
	public async purge(): Promise<void> {
		return this.service.purge();
	}

	/**
	 * Sets faithful to developer mode on for 3 hours for the domain faithfulpack.net, all sub-domains are affected too.
	 *
	 * Development Mode temporarily allows you to enter development mode for your websites if you need to make changes to your site.
	 * This will bypass Cloudflare's accelerated cache and slow down your site, but is useful if you are making changes to cacheable
	 * content (like images, css, or JavaScript) and would like to see those changes right away. Once entered, development mode will
	 * last for 3 hours and then automatically toggle off.
	 */
	@Get("dev/{mode}")
	@Security("cloudflare")
	public async dev(@Path() mode: DevMode): Promise<any> {
		return this.service.dev(mode);
	}
}
