import { app } from './app';
import { initDb } from './config/initDb';
import { PORT } from './config';

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
};

start();
