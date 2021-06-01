const router = require("express").Router();
const UserControllers = require("../controllers/userControllers.js");
const { authentication, authorization } = require("../middlewares/auth");

router.post("/login", UserControllers.login);
router.use(authentication);
router.get("/users", UserControllers.getAll);
router.get("/users/:id", UserControllers.getById);
router.put("/users/edit", authorization, UserControllers.editUser);
router.put("/users/:id/payTuition", UserControllers.uktStatus);
router.post("/users/:id/genDuitkuLink", UserControllers.forwardToDuitku);
router.get("/logout", UserControllers.logout);
module.exports = router;
