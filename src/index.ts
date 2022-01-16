import express, { Application, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { RegisterRoutes } from '../build/routes';
import { ValidateError } from "tsoa";

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

const v1 = require('./v1');
app.use('/v1', v1);

app.use(function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
});