import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { PackService } from "../service/pack.service";
import {
	AnyPack,
	CreationPackAll,
	FaithfulPack,
	Pack,
	PackAll,
	PackTag,
	Packs,
} from "../interfaces";

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
	 * Get all the tags from all packs (faithful, progart, etc)
	 */
	@Get("tags")
	public async getAllTags(): Promise<PackTag[]> {
		return this.service.getAllTags();
	}

	/**
	 * Get a pack by ID
	 */
	@Get("{pack_id}")
	public async getPack(@Path() pack_id: AnyPack): Promise<Pack> {
		return this.service.getById(pack_id);
	}

	@Get("{pack_id}/all")
	public async getWithSubmission(@Path() pack_id: FaithfulPack): Promise<PackAll> {
		return this.service.getWithSubmission(pack_id);
	}

	/**
	 * Search for packs by their tags
	 */
	@Get("search/{tag}")
	public async getTag(tag: PackTag): Promise<Packs> {
		return this.service.searchByTag(tag);
	}

	@Post("")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async create(@Body() body: CreationPackAll): Promise<CreationPackAll> {
		return this.service.create(body);
	}

	/**
	 * Edit an existing pack
	 * @param id pack ID
	 * @param body Pack information
	 */
	@Put("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async update(@Path() id: AnyPack, @Body() body: Pack): Promise<Pack> {
		return this.service.update(id, body);
	}

	/**
	 * Deletes the entire pack
	 * @param id pack ID
	 */
	@Delete("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async delete(id: AnyPack): Promise<void> {
		return this.service.delete(id);
	}
}
