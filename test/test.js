const assert = require('assert');
const wh = require('../app')

describe('Willhaben API', () => {
    it('should return results', function (done) {
        this.timeout(10000);
        wh.getListings('https://willhaben.at/iad/kaufen-und-verkaufen/marktplatz/pc-komponenten-5878').then(listings => {
            assert.notEqual(listings.length, 0, "length of result is not 0")
            done()
        })
    })
})

describe('Example Request', () => {
    it('should return results', function (done) {
        this.timeout(10000);

        wh.new()
        .keyword('elgato')
        .count(1000) // default is 1000
        .sortBy(wh.SortOrder.preisAufsteigend).search().then(listings => {
            assert.notEqual(listings.length, 0, "length of result is not 0")
            done()
        })
    })
})