import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { PackService } from "../service/pack.service";
import { Pack, PackTag, Packs } from "../interfaces";

@Route("packs")
@Tags("Packs")
export class PackController extends Controller {
	private readonly service = new PackService();

	/**
	 * Get the raw collection of packs
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, Pack>> {
		return this.service.getRaw();
	}

	/**
	 * Get a pack by ID
	 */
	@Get("{pack_id}")
	public async getPack(@Path() pack_id: string): Promise<Pack> {
		return this.service.getById(pack_id);
	}

	/**
	 * Search for packs by their tags
	 */
	@Get("search/{tag}")
	public async getTag(tag: PackTag): Promise<Packs> {
		return this.service.searchByTag(tag);
	}

	/**
	 * Get all the tags from all packs (faithful, progart, etc)
	 */
	@Get("tags")
	public async getTags(): Promise<PackTag[]> {
		return this.service.getAllTags();
	}

	@Post("")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async createPack(@Body() body: Pack): Promise<Pack> {
		return this.service.create(body.id, body);
	}

	/**
	 * Edit an existing pack
	 * @param id pack ID
	 * @param body Pack information
	 */
	@Put("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async update(@Path() id: string, @Body() body: Pack): Promise<Pack> {
		return this.service.update(id, body);
	}

	/**
	 * Deletes the entire pack
	 * @param id pack ID
	 */
	@Delete("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async delete(id: string): Promise<void> {
		return this.service.delete(id);
	}
}
