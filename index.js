let verbose = false

let util = require('util'),
    _ = require('underscore'),
    request	= require('request'),
    VError = require('verror')

let HitBTC = function HitBTC(api_key, secret, timeout)
{
    this.api_key = api_key
    this.secret = secret
    this.server = 'https://api.hitbtc.com/api/2'
    this.timeout = timeout || 20000
}

let headers = {"User-Agent": "nodejs-7.5-api-client"}

HitBTC.prototype.privateRequest = function(endpoint, method, params, callback)
{
    let functionName = 'HitBTC.privateRequest()',
        self = this

    let error

    if(!this.api_key || !this.secret)
    {
        error = new VError('%s must provide api_key and secret to make this API request.', functionName)
        return callback(error)
    }

    if(!_.isObject(params))
    {
        error = new VError('%s second parameter %s must be an object. If no params then pass an empty object {}', functionName, params)
        return callback(error)
    }

    if (!callback || typeof(callback) != 'function')
    {
        error = new VError('%s third parameter needs to be a callback function', functionName)
        return callback(error)
    }

	let auth = "Basic " + new Buffer(this.api_key + ":" + this.secret).toString("base64")
    let fullHeaders = { Authorization: auth }
    Object.assign(fullHeaders, headers)

    let options = {
        url: this.server + '/' + endpoint,
        method: method,
        headers: fullHeaders,
		form: params
	}

    let requestDesc = util.format('%s request to url %s with params %s',
        options.method, options.url, JSON.stringify(params))

    executeRequest(options, requestDesc, callback)
}

HitBTC.prototype.publicRequest = function(endpoint, params, callback)
{
    let functionName = 'HitBTC.publicRequest()'
    let error

    if(!_.isObject(params))
    {
        error = new VError('%s second parameter %s must be an object. If no params then pass an empty object {}', functionName, params)
        return callback(error)
    }

    if (!callback || typeof(callback) != 'function')
    {
        error = new VError('%s third parameter needs to be a callback function with err and data parameters', functionName)
        return callback(error)
    }

    let url = this.server + '/public/' + endpoint + ''
    if (verbose) console.log("Request URL is: " + url)

    let options = {
        url: url,
        method: 'GET',
        headers: headers,
        timeout: this.timeout,
        qs: params,
        json: {}        // request will parse the json response into an object
    }

    let requestDesc = util.format('%s request to url %s with parameters %s',
        options.method, options.url, JSON.stringify(params))

    executeRequest(options, requestDesc, callback)
}

function executeRequest(options, requestDesc, callback)
{
    let functionName = 'HitBTC.executeRequest()'
	if (verbose) console.log("Making request: " + requestDesc)

    request(options, function(err, response, data)
    {
        let error = null,   // default to no errors
            returnObject = data

		if (verbose) console.log("Data: " + JSON.stringify(data) + " Error: " + err)

        if(err)
        {
            error = new VError(err, '%s failed %s', functionName, requestDesc)
            error.name = err.code
        }
        else if (response.statusCode < 200 || response.statusCode >= 300)
        {
            error = new VError('%s HTTP status code %s returned from %s', functionName,
                response.statusCode, requestDesc)
            error.name = response.statusCode
        }
        else if (options.form)
        {
            try {
                returnObject = JSON.parse(data)
            }
            catch(e) {
                error = new VError(e, 'Could not parse response from server: ' + data)
            }
        }
        // if json request was not able to parse json response into an object
        else if (options.json && !_.isObject(data) )
        {
            error = new VError('%s could not parse response from %s\nResponse: %s', functionName, requestDesc, data)
        }

        if (_.has(returnObject, 'error_code'))
        {
            let errorMessage = mapErrorMessage(returnObject.error_code)

            error = new VError('%s %s returned error code %s, message: "%s"', functionName,
                requestDesc, returnObject.error_code, errorMessage)

            error.name = returnObject.error_code
        }

        callback(error, returnObject)
    })
}

//
// Public Functions
//

HitBTC.prototype.ticker = function getTicker(callback)
{
    this.publicRequest('ticker', {}, callback)
}

HitBTC.prototype.getTrades = function getTrades(symbol, callback)
{
	this.publicRequest('trades/' + symbol, { limit: 20 }, callback)
}

HitBTC.prototype.orderbook = function getOrderbook(symbol, callback)
{
	this.publicRequest('orderbook/' + symbol, { limit: 20 }, callback)
}


//
// Private Functions
//

HitBTC.prototype.tradingBalance = function tradingBalance(callback)
{
    this.privateRequest('trading/balance', 'GET', {}, callback)
}

HitBTC.prototype.accountBalance = function accountBalance(callback)
{
	this.privateRequest('account/balance', 'GET', {}, callback)
}

HitBTC.prototype.orders = function orders(callback)
{
	this.privateRequest('order', 'GET', {}, callback)
}

HitBTC.prototype.trades = function trades(callback)
{
	this.privateRequest('history/trades', 'GET', {}, callback)
}

HitBTC.prototype.transactions = function transactions(callback)
{
	this.privateRequest('account/transactions', 'GET', {}, callback)
}

/**
 * Maps the HitBTC error codes to error message
 * @param  {Integer}  error_code   HitBTC error code
 * @return {String}                error message
 */
function mapErrorMessage(error_code)
{
    let errorCodes = {
        10000: 'Required parameter can not be null',
        10001: 'Requests are too frequent',
        10002: 'System Error',
        10003: 'Restricted list request, please try again later',
        10004: 'IP restriction',
        10005: 'Key does not exist',
        10006: 'User does not exist',
        10007: 'Signatures do not match',
        10008: 'Illegal parameter',
        10009: 'Order does not exist',
        10010: 'Insufficient balance',
        10011: 'Order is less than minimum trade amount',
        10012: 'Unsupported symbol (not btc_usd or ltc_usd)',
        10013: 'This interface only accepts https requests',
        10014: 'Order price must be between 0 and 1,000,000',
        10015: 'Order price differs from current market price too much',
        10016: 'Insufficient coins balance',
        10017: 'API authorization error',
        10026: 'Loan (including reserved loan) and margin cannot be withdrawn',
        10027: 'Cannot withdraw within 24 hrs of authentication information modification',
        10028: 'Withdrawal amount exceeds daily limit',
        10029: 'Account has unpaid loan, please cancel/pay off the loan before withdraw',
        10031: 'Deposits can only be withdrawn after 6 confirmations',
        10032: 'Please enabled phone/google authenticator',
        10033: 'Fee higher than maximum network transaction fee',
        10034: 'Fee lower than minimum network transaction fee',
        10035: 'Insufficient BTC/LTC',
        10036: 'Withdrawal amount too low',
        10037: 'Trade password not set',
        10040: 'Withdrawal cancellation fails',
        10041: 'Withdrawal address not approved',
        10042: 'Admin password error',
        10100: 'User account frozen',
        10216: 'Non-available API',
        503: 'Too many requests (Http)'}

    if (!errorCodes[error_code])
    {
        return 'Unknown HitBTC error code: ' + error_code
    }

    return( errorCodes[error_code] )
}

module.exports = HitBTC
