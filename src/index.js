const dotenv = require('dotenv');
const app = require('./app');

const data = dotenv.config()
const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server running on port ${PORT}`);
});

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`\n🚀 ... Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
