import axios from "axios";
import { Controller, Post, Route, Security, Tags, Body } from "tsoa";
import { EmbedParam } from "../interfaces";
import { BadRequestError } from "../tools/ApiError";

const BOT_ENDPOINT = process.env.DISCORD_BOT_ENDPOINT;
const BOT_SEND_ENDPOINT = `${ BOT_ENDPOINT }send-embed`;

@Route("bot")
@Tags("Bot interaction")
export class BotController extends Controller {
	/**
	 * Allows API to send 1 embed as a private messages to people
	 * Check required and optional fields at https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
	 */
	@Post("/send-embed")
	@Security("bot", ["administrator"])
	public async sendEmbed(
		@Body() body: EmbedParam,
	): Promise<void> {
		console.log(body)
		return axios
			.post(BOT_SEND_ENDPOINT, body)
			.then(() => {})
			.catch(() => Promise.reject(new BadRequestError("Something wrong happened")));
	}
}