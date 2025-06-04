const SavedArticle = require("../Models/SavedArticle");



exports.saveArticle = async (req, res) => {

    const userId = req.user._id;

    try {
        let savedArticle = await SavedArticle({
            userId,
            title: req.body.title,
            description: req.body.description,
            url: req.body.url,
            urlToImage: req.body.urlToImage
        })
        await savedArticle.save();
        res.status(200).json(savedArticle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getSavedArticles = async (req, res) => {
    const userId = req.user._id;

    try {
        const savedArticle = await SavedArticle.find({ userId: userId });
        if (!savedArticle) {
            return res.status(404).json({ message: 'No saved articles found' });
        }
        res.status(200).json(savedArticle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
