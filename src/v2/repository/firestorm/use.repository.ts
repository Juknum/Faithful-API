import { Use, UseRepository, Uses } from "~/v2/interfaces";
import { mapUse, mapUses, unmapUse } from "../../tools/mapping/textures";
import { uses } from "../../firestorm";

export default class UseFirestormRepository implements UseRepository {
	getUsesByIdAndEdition(id_arr: number[], edition: string): Promise<Uses> {
		return uses.search([{
			field: "textureID",
			criteria: "in",
			value: id_arr,
		}, {
			field: "editions",
			criteria: "array-contains",
			value: edition
		}]).then(mapUses) // todo: remove this after rewrite
	}

	getRaw(): Promise<Uses> {
		return uses.read_raw()
			.then((res: any) => Object.values(res))
			.then(mapUses)
	}

	getUseByIdOrName(id_or_name: string): Promise<Uses | Use> {
		return uses.get(id_or_name)
			.then(mapUse) // todo: remove this after rewrite
			.catch(() => uses.search([{
				field: "textureUseName", // todo: use "name" after rewrite 
				criteria: "includes",
				value: id_or_name,
				ignoreCase: true,
			}])
				.then(mapUses) // todo: remove this after rewrite
				.then((out: Uses) => out.filter((use: Use) => use.name !== null)) // remove null names
			)
	}

	// todo: delete paths from it
	deleteUse(id: string): Promise<void> {
		return uses.remove(id);
	}

	set(use: Use): Promise<Use> {
		return uses.set(use.id, unmapUse(use))
	}
}