const router = require("express").Router();
const AnnouncementController = require("../controllers/announcemetControllers");

router.get("/announcement", AnnouncementController.getAnouncement);
router.post("/announcement", AnnouncementController.addAnnouncement);
router.delete("/announcement/:id", AnnouncementController.deleteAnnouncement);

module.exports = router;
