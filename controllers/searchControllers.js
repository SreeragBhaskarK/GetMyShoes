var searchHelper = require('../server/helpers/search-helpers');


exports.search = (req, res) => {
    var key = req.params.key;
    searchHelper.doSearchData(key).then(response=>{
        console.log(response);
        res.json(response)
    })
}