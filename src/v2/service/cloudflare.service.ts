import Cloudflare from "cloudflare";

const TOKEN = process.env.CLOUDFLARE_KEY;

export default class CloudflareService {
	private readonly cf = new Cloudflare({
		apiToken: TOKEN,
	});

	private async zoneIds(): Promise<string[]> {
		const res = await this.cf.zones.list();
		return res.result.map((e) => e.id);
	}

	public async purge(): Promise<any> {
		// permission needed: #zone:read
		const res = await this.cf.zones.list();

		// permission needed: #cache_purge:edit
		const response = await Promise.all(
			res.result
				.map((e) => e.id)
				.map((id) =>
					this.cf.cache.purge({
						zone_id: id,
						purge_everything: true,
					}),
				),
		);

		return response;
	}

	public async dev(mode: "on" | "off"): Promise<any> {
		// permission needed: #zone_settings:edit
		const ids = await this.zoneIds();
		return Promise.all(
			ids.map((id) =>
				this.cf.zones.settings.developmentMode.edit({
					zone_id: id,
					value: mode,
				}),
			),
		);
	}
}
