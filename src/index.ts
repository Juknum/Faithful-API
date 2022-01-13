import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import Router from './routes';

const PORT = process.env.PORT || 8000;

const app: Application = express();
app.use(express.static('public'));

//serves docs
app.use(
	'/docs',
	swaggerUi.serve,
	swaggerUi.setup(undefined, {
		swaggerOptions: {
			url: '/swagger.json',
		},
	}),
);

app.use(Router); //endpoints

app.listen(PORT, () => {
	console.log('Server is running on port', PORT);
});
