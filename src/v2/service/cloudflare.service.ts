import Cloudflare from "cloudflare";
import axios from "axios";

const TOKEN = process.env.CLOUDFLARE_KEY;

export default class CloudflareService {
	private readonly cf = Cloudflare({
		token: TOKEN,
	});

	private async zoneIds(): Promise<Array<String>> {
		// https://cloudflare.github.io/node-cloudflare/#zonesbrowse
		const res = await this.cf.zones.browse();
		return res.result.map((e) => e.id);
	}

	public async purge(): Promise<any> {
		// https://cloudflare.github.io/node-cloudflare/#zonesbrowse
		// https://api.cloudflare.com/#zone-list-zones
		// permission needed: #zone:read
		const res = await this.cf.zones.browse();

		// https://cloudflare.github.io/node-cloudflare/#zonespurgecache
		// https://api.cloudflare.com/#zone-purge-all-files
		// permission needed: #cache_purge:edit
		const response = await Promise.all(
			res.result
				.map((e) => e.id)
				.map((id) =>
					this.cf.zones.purgeCache(id, {
						purge_everything: true,
					}),
				),
		);

		if (Array.isArray(response))
			response.forEach((zone) => {
				delete zone.result;
			});

		return response;
	}

	public async dev(mode: "on" | "off"): Promise<any> {
		// https://api.cloudflare.com/#zone-settings-change-development-mode-setting
		// PATCH zones/:zone_identifier/settings/development_mode
		// permission needed: #zone_settings:edit

		const ids = await this.zoneIds();

		const responses = await Promise.all(
			ids.map((zone) =>
				axios.patch(
					`https://api.cloudflare.com/client/v4/zones/${zone}/settings/development_mode`,
					{
						value: mode,
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${TOKEN}`,
						},
					},
				),
			),
		);

		return responses.map((r) => r.data);
	}
}
