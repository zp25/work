const path = require('path');
const express = require('express');
const compression = require('compression');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');

dotenv.config({ silent: true });

const app = express();

const static = path.resolve(__dirname, 'dist');

/** const */
app.set('port', process.env.PORT || 3001);

/** middleware */
app.use(compression())
app.use(express.static(static));

/** error handling middleware should be loaded after the loading the routes */
app.use(errorHandler());

/** engine start! */
app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});
