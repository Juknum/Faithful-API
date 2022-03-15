import { Body, Controller, Delete, Get, Post, Route, Security, Tags } from "tsoa";
import { Contributions, Contribution, ContributionCreationParams } from "../interfaces";
import ContributionService from "../service/contributions.service";

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

	@Get("{id}")
	public async getContributionById(id: string): Promise<Contribution> {
		return this.service.getById(id);
	}
	
	@Get("between/{begin}/{ends}")
	public async getContributionInRange(begin: string, ends: string): Promise<Contributions> {
		return this.service.getByDateRange(begin, ends);
	}

	@Get("from/{date}")
	public async getContributionFrom(date: string): Promise<Contributions> {
		return this.service.getByDateRange(date, new Date().getTime().toString());
	}

	@Get("before/{date}")
	public async getContributionBefore(date: string): Promise<Contributions> {
		return this.service.getByDateRange("0", date);
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
}