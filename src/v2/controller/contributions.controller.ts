import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
	Response,
	Route,
	Security,
	Tags,
} from "tsoa";
import {
	Contributions,
	Contribution,
	ContributionCreationParams,
	ContributionsAuthors,
	ContributionStats,
	ContributionSearch,
	FaithfulPack,
} from "../interfaces";
import ContributionService from "../service/contributions.service";
import { NotAvailableError } from "../tools/ApiError";
import cache from "../tools/cache";

@Route("contributions")
@Tags("Contributions")
export class ContributionsController extends Controller {
	private readonly service = new ContributionService();

	/**
	 * Get the raw collection of contributions
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, Contribution>> {
		return this.service.getRaw();
	}

	/**
	 * Get all general contribution statistics
	 */
	@Response<NotAvailableError>(408)
	@Get("stats")
	public async getStats(): Promise<ContributionStats> {
		return cache.handle("contributions-stats", () => this.service.getStats());
	}

	/**
	 * Get all resource packs with contributions
	 */
	@Get("packs")
	public async getPacks(): Promise<FaithfulPack[]> {
		return this.service.getPacks();
	}

	/**
	 * Get all users who have contributed to a resource pack before
	 */
	@Get("authors")
	public async getAuthors(): Promise<ContributionsAuthors> {
		return this.service.getAuthors();
	}

	/**
	 * Filter contributions by either pack or contributor
	 * @param packs List of resource packs joined by '-'
	 * @param users List of user ids joined by '-'
	 * @param search Contribution to search for
	 */
	@Get("search")
	public async searchWithTextureAndUser(
		@Query() packs?: string,
		@Query() users?: string,
		@Query() search?: string,
	): Promise<Contributions> {
		const params: ContributionSearch = {
			packs: packs && packs !== "all" ? packs.split("-") : null,
			users: users ? users.split("-") : [],
			search,
		};

		return this.service.search(params);
	}

	/**
	 * Get texture by internal ID (e.g. 61cdce61d3697)
	 * @param id Contribution ID
	 */
	@Get("{id}")
	public async getContributionById(id: string): Promise<Contribution> {
		return this.service.getById(id);
	}

	/**
	 * Get contributions by user and pack
	 * @param {String} users List of user ids joined by '-'
	 * @param {String} packs List of resource packs joined by '-'
	 */
	@Get("search/{users}/{packs}")
	public async searchContributionsFrom(users: string, packs: string): Promise<Contributions> {
		if (packs === "all") return this.service.searchContributionsFrom(users.split("-"), null);
		return this.service.searchContributionsFrom(users.split("-"), packs.split("-"));
	}

	/**
	 * Get all contributions between a given set of timestamps
	 * @param begin Starting timestamp
	 * @param ends Ending timestamp
	 */
	@Get("between/{begin}/{ends}")
	public async getContributionInRange(begin: string, ends: string): Promise<Contributions> {
		return this.service.getByDateRange(begin, ends);
	}

	/**
	 * Get all contributions from a given date until now
	 * @param timestamp Where to start counting
	 */
	@Get("from/{timestamp}")
	public async getContributionFrom(timestamp: string): Promise<Contributions> {
		return this.service.getByDateRange(timestamp, new Date().getTime().toString());
	}

	/**
	 * Get all contributions before a given date
	 * @param timestamp Where to stop counting
	 */
	@Get("before/{timestamp}")
	public async getContributionBefore(timestamp: string): Promise<Contributions> {
		return this.service.getByDateRange("0", timestamp);
	}

	/**
	 * Add a contribution or multiple contributions
	 * @param body Contribution information
	 */
	@Post()
	@Security("discord", ["administrator"])
	@Security("bot")
	public async addContribution(
		@Body() body: ContributionCreationParams | ContributionCreationParams[],
	): Promise<Contribution | Contribution[]> {
		return Array.isArray(body)
			? this.service.addContributions(body)
			: this.service.addContribution(body);
	}

	/**
	 * Delete a contribution by internal ID (e.g. 61cdce61d3697)
	 * @param id Contribution ID
	 */
	@Delete("{id}")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async deleteContribution(id: string): Promise<string> {
		return this.service.deleteContribution(id);
	}

	/**
	 * Update existing contribution with new information by internal ID (e.g. 61cdce61d3697)
	 * @param id Internal ID
	 * @param body New information
	 */
	@Put("{id}")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async updateContribution(
		id: string,
		@Body() body: ContributionCreationParams,
	): Promise<Contribution> {
		return this.service.updateContribution(id, body);
	}
}
