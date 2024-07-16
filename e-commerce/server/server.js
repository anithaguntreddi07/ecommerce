const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userCtrl = require('./controllers/userCtrl');
const auth = require('./middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/user/register', userCtrl.register);
app.post('/user/login', userCtrl.login);
app.get('/user/logout', userCtrl.logout);
app.get('/user/info', auth, userCtrl.getUser);
app.post('/user/refresh_token', userCtrl.refreshtoken);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/categoryRouter'));


const URI = process.env.MONGODB_URL;

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});
