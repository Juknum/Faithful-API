import { Controller, Get, Route, Tags } from "tsoa";

@Route("resources")
@Tags("Resources")
export class ResourcesController extends Controller {

	@Get("hello-world")
	public async helloWorld(): Promise<string> {
		return "Hello, World!";
	}
}

