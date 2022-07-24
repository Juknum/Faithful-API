import { Body, Controller, Delete, Get, Post, Put, Query, Response, Route, Security, Tags } from "tsoa";
import { Contributions, Contribution, ContributionCreationParams, ContributionsAuthors, ContributionsPacks, ContributionStats, ContributionSearch } from "../interfaces";
import ContributionService from "../service/contributions.service";
import { NotAvailableError } from "../tools/ApiError";
import cache from "../tools/cache";

@Route("contributions")
@Tags("Contributions")
export class ContributionsController extends Controller {
	private readonly service: ContributionService = new ContributionService();

	/**
	 * Get the raw collection of contributions
	 */
	@Get("raw")
	public async getRaw(): Promise<Contributions> {
		return this.service.getRaw();
	}

	/**
	 * Get all add-ons stats for public
	 */
	@Response<NotAvailableError>(408)
	@Get("stats")
	public async getStats(): Promise<ContributionStats> {
		return cache.handle('contributions-stats', () => this.service.getStats())
	}

	/**
	 * Get all resource packs that have been contributed to
	 */
	@Get("packs")
	public async getPacks(): Promise<ContributionsPacks> {
		return this.service.getPacks();
	}

	@Get("authors")
	public async getAuthors(): Promise<ContributionsAuthors> {
		return this.service.getAuthors();
	}

	@Get("search")
	public async searchWithTextureAndUser(
		@Query() packs?: string,
		@Query() users?: string,
		@Query() search?: string,
	): Promise<Contributions> {
		const params: ContributionSearch = {
			packs: packs && packs !== 'all' ? packs.split('-') : undefined,
			users: users ? users.split('-') : undefined,
			search,
		}
		
		return this.service.search(params)
	}

	@Get("{id}")
	public async getContributionById(id: string): Promise<Contribution> {
		return this.service.getById(id);
	}

	/**
	 * @param {String} users should be the discord users ids joined by '-'
	 * @param {String} packs should be the resource packs joined by '-'
	 */
	@Get("search/{users}/{packs}")
	public async searchContributionsFrom(users: string, packs: string): Promise<Contributions> {
		if (packs === "all") return this.service.searchContributionsFrom(users.split("-"), null);
		return this.service.searchContributionsFrom(users.split("-"), packs.split("-"));
	}
	
	@Get("between/{begin}/{ends}")
	public async getContributionInRange(begin: string, ends: string): Promise<Contributions> {
		return this.service.getByDateRange(begin, ends);
	}

	@Get("from/{timestamp}")
	public async getContributionFrom(timestamp: string): Promise<Contributions> {
		return this.service.getByDateRange(timestamp, new Date().getTime().toString());
	}

	@Get("before/{timestamp}")
	public async getContributionBefore(timestamp: string): Promise<Contributions> {
		return this.service.getByDateRange("0", timestamp);
	}

	@Post()
	@Security('discord', ['administrator']) // avoid contributions to be set by anybody
	@Security('bot')
	public async addContribution(@Body() body: ContributionCreationParams): Promise<Contribution> {
		return this.service.addContribution(body);;
	}

	@Delete("{id}")
	@Security('discord', ['administrator']) // avoid contributions to be set by anybody
	@Security('bot')
	public async deleteContribution(id: string): Promise<void> {
		return this.service.deleteContribution(id);
	}

	@Put("{id}")
	@Security('discord', ['administrator'])
	@Security('bot')
	public async updateContribution(id: string, @Body() body: ContributionCreationParams): Promise<Contribution> {
		return this.service.updateContribution(id, body);
	}

}