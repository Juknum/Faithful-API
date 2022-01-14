import express, { Application, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import v2 from './v2/routes';
const v1 = require('./v1/main.js');

(async () => {
	const PORT = process.env.PORT || 8000;

	const app: Application = express();
	app.use(express.static('public'));

	let css: string = (await fs.readFileSync(path.join(__dirname, '../public/custom.css'))).toString();

	//serves docs
	app.use(
		'/docs',
		swaggerUi.serve,
		swaggerUi.setup(require('../public/swagger.json'), undefined, undefined, css, 'https://database.compliancepack.net/images/brand/icons/general/compliance_white.ico', undefined, 'Compliance API'),
	);

	// endpoints
	app.use('/v1', v1);
	app.use('/v2', v2);

	app.listen(PORT, () => {
		console.log(`Server is running at http://localhost:${PORT}`);
	});
})();