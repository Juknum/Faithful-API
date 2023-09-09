import { APIEmbed } from "discord-api-types/v9";

type Destinator = "channels" | "users";
type DestinationsObject = { [d in Destinator]?: string[] };

export interface EmbedParam {
	destinator: string | "";
	embed: APIEmbed;
	destinations?: DestinationsObject;
}
