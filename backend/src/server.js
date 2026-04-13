const app = require('./app');

const { PORT } = process.env;

// Open Server on selected Port
app.listen(
    PORT,
    () => console.info('Server listening on port ', PORT)
);