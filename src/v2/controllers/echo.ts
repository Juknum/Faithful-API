import { Body, Get, Post, Route } from 'tsoa';

interface echoResponse {
	message: string;
}
interface echoRequirements {
	message: string;
}

@Route('echo')
export default class Echo {
	@Get('/')
	public getMessage(): number {
		return 400;
	}

	@Post('/')
	public async postMessage(@Body() body: echoRequirements): Promise<echoResponse> {
		return { message: body.message };
	}
}
