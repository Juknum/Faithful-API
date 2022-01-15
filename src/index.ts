import express, { Application, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import v2 from './v2';
import v1 from './v1';

(async () => {
	const PORT = process.env.PORT || 8000;

	const app: Application = express();
	app.use(express.static('public', {
		extensions: ['html', 'xml', 'json']
	}))

	app.get('/', function (req, res) {
		res.redirect('/docs')
	})

	app.use((_req, res, next) => {
		res.append('Access-Control-Allow-Origin', '*')
		next()
	})

	let css: string = fs.readFileSync(path.join(__dirname, '../public/custom.css')).toString();

	// endpoints
	app.use('/v1', new v1());
	app.use('/v2', v2);

	const swaggerDoc = require('../public/swagger.json');
	const options: SwaggerUiOptions = {
		customCssUrl: '/custom.css',
		customfavIcon: 'https://database.compliancepack.net/images/brand/logos/site/compliance_white.ico',
		customSiteTitle: 'Compliance API',

		// customCss?: string | undefined;
		// customJs?: string | undefined;
		// customSiteTitle?: string | undefined;
		// explorer?: boolean | undefined;
		// isExplorer?: boolean | undefined;
		// swaggerOptions?: SwaggerOptions | undefined;
		// swaggerUrl?: string | undefined;
		// swaggerUrls?: string[] | undefined;
	}

	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));

	app.listen(PORT, () => {
		console.log(`Server is running at http://localhost:${PORT}`);
	});
})();