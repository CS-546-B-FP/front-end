import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import { create } from 'express-handlebars';

import registerRoutes from './routes/index.js';
import { registerHandlebarsHelpers } from './config/handlebars-helpers.js';
import { attachViewContext } from './middleware/view-context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 3000;

const hbs = create({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: registerHandlebarsHelpers(),
  runtimeOptions: { data: true }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(attachViewContext);
registerRoutes(app);

app.listen(port, () => {
  console.log(`LeaseWise NYC front-end running on http://localhost:${port}`);
});
