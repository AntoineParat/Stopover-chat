const express = require ("express")
const userControler = require ('../controler/userControl');
const router = express.Router();

router.post('/webhook', userControler.webhook); //STRIPE WEBHOOK
router.post('/api/user/create-user', userControler.createUser);
router.post('/api/login', userControler.login);

router.get('/api/logout', userControler.logout);
router.get('/api/user/info', userControler.getUserInfo);
router.get('/api/user/sendMail', userControler.sendMail);
router.get('/api/user/getName', userControler.getName);

router.patch('/api/user/resetPassword', userControler.resetPassword);

router.delete('/api/delete/subscription', userControler.deleteSubscription)

module.exports = router
