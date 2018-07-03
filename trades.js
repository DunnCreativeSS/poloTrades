const express = require('express');
const app = express();
var request = require("request")
var bodyParser = require('body-parser')
app.use('/media', express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/public'));
const BFX = require('bitfinex-api-node')
const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex();

//var pairs = ["ETHBTC", 'BTCUSD']
var pairs = []
const bfx = new BFX({
  apiKey: 'MR0EZBtqMNn4WPYW4BzOlA0dLAelyGM5QY8LGfvhTX1',
  apiSecret: process.env.bitfinex,

  ws: {
    autoReconnect: true,
    seqAudit: true,
    packetWDDelay: 10 * 1000
  }
})

var Binance = require("node-binance-api");
const binance = new Binance().options({
  APIKEY: '0zJfmWUiPqtxXWqwh7NQB68q0oJfvh99KOAGmENrnuuZf5aA6PBOgPAEcxATn3AX',
  APISECRET: process.env.binance,
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true // If you want to use sandbox mode where orders are simulated
});
var HitBTC = require("./index.js");
let publicClient = new HitBTC()

var hitBtcTrades = []
function afterTicker(){
ppdo(pairs, 0);

function ppdo(pairs, i){
	setTimeout(function(){
publicclinedo(pairs[i]);
if (i < pairs.length){
	i++;
}else {
	i = 0;
}
	ppdo(pairs, i + 1);
}, 100);
}
function publicclinedo(ko){
	if (ko != undefined){
	ko = ko.split('_')[1]+ko.split('_')[0];
	//console.log('hitbtc ' + ko);
	publicClient.getTrades(ko,function(err,data) {
	if (hitBtcTrades[ko] == undefined){
		hitBtcTrades[ko] = []
	}
	for (var t in data){
		if (!hitBtcTrades[ko].includes(data[t].id)){
			hitBtcTrades[ko].push(data[t].id);
			//console.log('hitbtc ' + k );
			//console.log(data[t]);
			if (prices[ko] == undefined){
				  prices[ko] = []
			  }
			 // console.log(data[t]);
			  if (data[t].code != 2001){
				 // console.log(data[t]);
			  prices[ko]['hitbtc'] = data[t].price;
			 // console.log( prices[ko]);
			  }
		}
	}
})
	}
}
const ws = bfx.ws()

ws.on('error', (err) => {})
ws.on('open', () => {
	if (tickerb == true){
		tickerb = false;
	for (var p in pairs){
		var arr = pairs[p].split('_');
		var pair = arr[1] + arr[0]
		console.log('subs ' + pair);
  ws.subscribeTrades(pair)
  wsonsubscribe(pair);
	}
	}
})
function wsonsubscribe(k){
	setTimeout(function(){
	console.log('bfx bin: ' + k);
ws.onTrades({ pair: k }, (trades) => {
	//console.log(trades);
	if (prices[k] == undefined){
				  prices[k] = []
			  }
			//  console.log(trades);
			  prices[k]['bitfinex'] = trades[0][3];
			 // console.log( prices[k]);
  //console.log(`bitfinex: ${JSON.stringify(trades)}`)
})
binance.websockets.trades(k, (trades) => {
	//console.log(trades);
  let {e:eventType, E:eventTime, s:symbol, p:price, q:quantity, m:maker, a:tradeId} = trades;
  if (prices[symbol] == undefined){
	  prices[symbol] = []
  }
  prices[symbol]['binance'] = price;
//  console.log( prices[symbol]);
 // console.log(symbol+" binance update. price: "+price+", quantity: "+quantity+", maker: "+maker);
});
	}, Math.random() * 50 * pairs.length);
}


ws.open()

for (var p in pairs){
poloniex.subscribe(pairs[p]);
}
var tots = []
poloniex.on('message', (channelName, data, seq) => {
  if (channelName === 'ticker') {
    console.log(`Ticker: ${data}`);
  }
 
  if (channelName === channelName) {
	for (var d in data){
		if (data[d].type == 'orderBook'){
			console.log('polo ob');
		}
		if (data[d].type == 'newTrade'){
			//console.log(data[d]);
			if (prices[channelName.split('_')[1] + channelName.split('_')[0]] == undefined){
				  prices[channelName.split('_')[1] + channelName.split('_')[0]] = []
			  }
			 // console.log( prices[channelName]);
			 // prices[channelName.split('_')[1] + channelName.split('_')[0]]['poloniex'] = data[d].data.rate;
					
		}
	}
  }
});
}
app.get('/', function (req, res){
	var msg = "";
	for (var p in pairs){
	var tot = 0;
	var count = 0;
	for (var ex in prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]]){
		//console.log(ex);
		tot+=parseFloat(prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]][ex]);
		count++;
	}
	var avg = (tot / (count)).toFixed(8);
	if (prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]] != undefined){
	if (prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]]['poloniex'] != undefined){
	var poloDiff = parseFloat(prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]]['poloniex']) / avg;
	//console.log(pairs[p] + ': ' + poloDiff);
	if (count > 0 && (poloDiff > 1.01 || poloDiff < 0.99)){
		msg+='<br>'+(prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]]);
		msg+='<br>'+ (count + ' count');
	msg+='<br>'+(pairs[p].split('_')[1] + pairs[p].split('_')[0] + ' avg ' + avg);
	msg+=('<br>polo rate: ' + prices[pairs[p].split('_')[1] + pairs[p].split('_')[0]]['poloniex']);
	msg+=('<br>poloDiff: ' + poloDiff);
		msg+=('<br><br>');
	}
	}
	}
	}
	res.send(msg);
})
poloniex.returnTicker(function (err, ticker) {
  if (err) {
    console.log(err.message);
  } else {
    for (var p in ticker){
		console.log(p);
		if (!pairs.includes(p)){
		pairs.push(p);
		}
	}
	if (aftert == true){

	setTimeout(function(){
	afterTicker();
	console.log('aft');
	}, 5000);
	aftert= false;
	}
  }
});
var tickerbin = true;
var tickerb = true;
poloniex.openWebSocket({ version: 2 });
var aftert = true;

var prices = []
            app.listen(process.env.PORT || 8080, function() {});
