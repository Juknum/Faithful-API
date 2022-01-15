import express, { Application, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { RegisterRoutes } from '../build/routes';
import v1 from './v1';

const PORT = process.env.PORT || 8000;

const app: Application = express();
app.use(
	express.static('public', {
		extensions: ['html', 'xml', 'json'],
	}),
);

app.get('/', function (req, res) {
	res.redirect('/docs');
});

app.use((_req, res, next) => {
	res.append('Access-Control-Allow-Origin', '*');
	next();
});

let css: string = fs.readFileSync(path.join(__dirname, '../public/custom.css')).toString();

const swaggerDoc = require('../public/swagger.json');
const options: SwaggerUiOptions = {
	customCssUrl: '/custom.css',
	customfavIcon: 'https://database.compliancepack.net/images/brand/logos/site/compliance_white.ico',
	customSiteTitle: 'Compliance API',
};
//todo: find out what the fuck we are doing
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

RegisterRoutes(app);
