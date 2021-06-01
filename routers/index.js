const router = require("express").Router();
const UserRouter = require("./userRouters");
const LectureRouter = require("./lectureRouters");
const ClassRouter = require("./classRouters");
const AnnouncemetRouter = require("./announcemetRouters");

router.use("/", UserRouter);
router.use("/", LectureRouter);
router.use("/", ClassRouter);
router.use("/", AnnouncemetRouter);

module.exports = router;
