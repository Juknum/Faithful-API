import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { PackService } from "../service/pack.service";
import { AnyPack, CreationPackAll, Pack, PackAll, PackTag, PackType, Packs } from "../interfaces";

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
	 * Search for packs by property (AND logic, needs to match all criteria to be shown)
	 * @param tag Pack tag to search by
	 * @param name Display name to search by
	 * @param resolution Resolution to search by
	 */
	@Get("search")
	public async searchPacks(
		@Query() tag?: PackTag,
		@Query() name?: string,
		@Query() resolution?: number,
		@Query() type?: PackType,
	): Promise<Packs> {
		return this.service.search({ tag, name, resolution, type });
	}

	/**
	 * Get a pack by ID
	 * @param pack_id Supported pack
	 */
	@Get("{pack_id}")
	public async getPack(@Path() pack_id: AnyPack): Promise<Pack> {
		return this.service.getById(pack_id);
	}

	/**
	 * Change a pack ID and all its contributions if possible
	 * @param old_pack Pack ID to replace
	 * @param new_pack Pack ID to replace with
	 */
	@Put("rename/{old_pack}/{new_pack}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async renamePack(@Path() old_pack: AnyPack, @Path() new_pack: string): Promise<void> {
		return this.service.renamePack(old_pack, new_pack);
	}

	/**
	 * Get a pack and its associated submission information by ID
	 * @param pack_id Pack ID
	 */
	@Get("{pack_id}/all")
	public async getWithSubmission(@Path() pack_id: AnyPack): Promise<PackAll> {
		return this.service.getWithSubmission(pack_id);
	}

	/**
	 * Create a pack, or a pack and submission at the same time
	 * @param body Pack (or pack and submission) to add
	 */
	@Post("")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async create(@Body() body: CreationPackAll): Promise<CreationPackAll> {
		return this.service.create(body);
	}

	/**
	 * Edit an existing pack
	 * @param id Pack ID
	 * @param body Pack information
	 */
	@Put("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async update(@Path() id: AnyPack, @Body() body: Pack): Promise<Pack> {
		return this.service.update(id, body);
	}

	/**
	 * Deletes the entire pack, including associated submission information
	 * @param id Pack ID
	 */
	@Delete("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async delete(id: AnyPack): Promise<void> {
		return this.service.delete(id);
	}
}
