import axios from "axios";
import { EmbedParam } from "../interfaces";

const BOT_ENDPOINT = process.env.DISCORD_BOT_ENDPOINT;
const BOT_SEND_ENDPOINT = `${ BOT_ENDPOINT }send-embed`;

export default class BotService {
	public sendEmbed(params: EmbedParam): Promise<void> {
		return axios
			.post(BOT_SEND_ENDPOINT, params)
			.then(() => {})
			.catch((e) => { throw e; });
	}
}
