const express = require ("express")
const roomControler = require ('../controler/roomControl');
const router = express.Router();


router.post('/api/createRoom', roomControler.createRoom);
router.post('/api/joinRoom', roomControler.joinRoom);
router.get('/api/getHistory', roomControler.getHistory);



module.exports = router