HitBTC = require('./index.js')

// Test public data APIs
let publicClient = new HitBTC()


publicClient.ticker(function(err,data) {
    console.log(data)
})

publicClient.orderbook('ETHBTC', function(err,data) {
	console.log(data)
})