import express from 'express';
import path from 'path';

import routerAPI from './routes/api';

const app = express();

app
  .use('/api', routerAPI)
  .get('/', (req, res) => res.sendFile(path.resolve(__dirname + '/../client/index.html', )))
  .use('/static', express.static(path.resolve(__dirname + '/../../static')));

app.listen('3000', console.log.call(console, 'Listening on port 3000...'));
