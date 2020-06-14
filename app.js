const axios = require('axios');

// Function to get the product list from Elevenia API
var getAPIElevenia = async () => {
    let config = {
        headers: {
          openapikey: '721407f393e84a28593374cc2b347a98',
        }
      }

      var products = await axios.get('http://api.elevenia.co.id/rest/cateservice/category', config)
      .then(function (response) {

        return response
      })

      return products
}

module.exports = {
    getAPIElevenia,
}