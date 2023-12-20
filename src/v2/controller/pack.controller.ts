import { Controller, Get, Path, Route, Tags } from "tsoa";
import { PackService } from "../service/pack.service";
import { Pack } from "../interfaces";

@Route("packs")
@Tags("Packs")
export class PackController extends Controller {
	private readonly service = new PackService();

	@Get("raw")
	public async getRaw(): Promise<Record<string, Pack>> {
		return this.service.getRaw();
	}

	@Get("{pack_id}")
	public async getPack(@Path() pack_id: string): Promise<Pack> {
		return this.service.getById(pack_id);
	}
}
