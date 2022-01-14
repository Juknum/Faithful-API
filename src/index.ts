import express, { Application, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import Router from './routes';

(async () => {
	const PORT = process.env.PORT || 8000;

	const app: Application = express();
	app.use(express.static('public'));

	let css: string = (await fs.readFileSync(path.join(__dirname, '../public/custom.css'))).toString();

	//serves docs
	app.use(
		'/',
		swaggerUi.serve, //'', '/swagger.json', 'Compliance API'
		swaggerUi.setup(require('../public/swagger.json'), undefined, undefined, css, 'https://database.compliancepack.net/images/brand/icons/general/compliance_white.ico', undefined, 'Compliance API'),
	);

	app.use(Router); // endpoints

	app.listen(PORT, () => {
		console.log(`Server is running at http://localhost:${PORT}`);
	});
})();