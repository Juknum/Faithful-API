import { Controller, Post, Route, Security, Tags, Body } from "tsoa";
import { EmbedParam } from "../interfaces";
import BotService from "../service/bot.service";

@Route("bot")
@Tags("Bot interaction")
export class BotController extends Controller {
	private readonly botService = new BotService();

	/**
	 * Allows API to send 1 embed as a private messages to people
	 * Check required and optional fields at https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
	 */
	@Post("/send-embed")
	@Security("bot", ["administrator"])
	public async sendEmbed(
		@Body() body: EmbedParam,
	): Promise<void> {
		return this.botService.sendEmbed(body);
	}
}
