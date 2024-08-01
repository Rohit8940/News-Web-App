const express = require("express");
const {
    allMessages,
    sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const { saveArticle, getSavedArticles } = require("../controllers/articleController");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").get(protect, getSavedArticles);
router.route("/").post(protect, sendMessage);
router.route("/save").post(protect, saveArticle);

module.exports = router;
