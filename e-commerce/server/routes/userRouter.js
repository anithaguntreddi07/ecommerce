const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/info', auth, userCtrl.getUser);
router.post('/refresh_token', userCtrl.refreshtoken);

module.exports = router;
