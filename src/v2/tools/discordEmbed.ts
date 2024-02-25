import axios from "axios";
import { APIEmbed } from "discord-api-types/v10";

/**
 * Send a Discord embed to a webhook logger channel
 * @param embed The embed to send
 */
export async function discordEmbed(embed: APIEmbed): Promise<void> {
	if (!process.env.WEBHOOK_URL) return;

	// faithful green by default
	if (!embed.color) embed.color = 7784773;

	await axios.post(process.env.WEBHOOK_URL, { embeds: [embed] });
}
