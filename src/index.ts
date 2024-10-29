import express from 'express';
import cors from 'cors';
import { AppDataSource } from './infra/data-source';
import routes from './routes/routes';

AppDataSource.initialize().then(() => {
  const app = express();
  app.use(cors());

  app.use(express.json());
  app.use('/api/v1/', routes);

  return app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
});
