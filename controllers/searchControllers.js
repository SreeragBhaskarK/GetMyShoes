var searchHelper = require('../server/helpers/search-helpers');


exports.search = (req, res) => {
    var key = req.params.key;

    searchHelper.doSearchData(key).then(response => {
        res.json(response)
    })
}

