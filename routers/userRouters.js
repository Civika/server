const router = require("express").Router();
const UserControllers = require("../controllers/userControllers.js");
const {
  authentication,
  authorization,
} = require("../middlewares/auth");

router.post("/login", UserControllers.login);
router.use(authentication);
router.get("/users", UserControllers.getAll);
router.get("/users/:id", UserControllers.getById);
router.put("/users/edit", authorization, UserControllers.editUser);
//router.post("/users/:id/payTuition")
module.exports = router;
