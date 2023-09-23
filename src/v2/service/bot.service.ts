import axios from "axios";
import { EmbedParam } from "../interfaces";

const BOT_ENDPOINT = process.env.DISCORD_BOT_ENDPOINT;
const SEND_EMBED = !process.env.DO_NOT_SEND_EMBED || process.env.DO_NOT_SEND_EMBED !== "true";
const BOT_SEND_ENDPOINT = `${BOT_ENDPOINT}send-embed`;

export default class BotService {
	public sendEmbed(params: EmbedParam): Promise<void> {
		if (!SEND_EMBED) {
			console.log(params);
			return Promise.resolve();
		}

		return axios
			.post(BOT_SEND_ENDPOINT, params)
			.then(() => {})
			.catch((e) => {
				throw e;
			});
	}
}
