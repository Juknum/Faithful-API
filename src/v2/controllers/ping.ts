import { Get, Route } from 'tsoa';

interface PingResponse {
	message: string;
}

@Route('ping')
export default class Ping {
	@Get('/')
	public async getMessage(): Promise<PingResponse> {
		return {
			message: 'pong',
		};
	}
}
