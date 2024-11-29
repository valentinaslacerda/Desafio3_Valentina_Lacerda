import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './infra/data-source';
import routes from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger.json';

const app = express();
AppDataSource.initialize().then(() => {
  app.use(cors());

  app.use(express.json());

  app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use('/api/v1/', routes);

  app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
});

export default app;
