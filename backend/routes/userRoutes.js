const express = require("express");
const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();//for maing http request(same hai jaise hum main server.js me app.get karte hai waise hi but yaha pe hum server.js me middleware banake then userRouter ko connect kar rhe hai so that clean dikhe)

//there are two methods of creating routes using the express.Router() (we can also group multiple routes using this)
router.route('/').post(registerUser).get(protect,allUsers);

router.post('/login',authUser);

module.exports = router;

