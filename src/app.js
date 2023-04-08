const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const painRoutes = require('./routes/pain.routes');
const sensorRoutes = require('./routes/sensor.routes');
const gaRoutes = require('./routes/ga.routes');
const categoryRoutes = require('./routes/category.routes');


const app = express();

const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'https://alexa-admin.netlify.app',
    'https://localhost',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8100'
];

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use('/user',userRoutes);
app.use('/pain',painRoutes);
app.use('/sensor',sensorRoutes);
app.use('/ga',gaRoutes);
app.use('/category',categoryRoutes);

module.exports = app;