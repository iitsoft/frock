import url from 'url'

export default addUtilMiddleware

function addUtilMiddleware (log, router) {
  return processRequest

  function processRequest (req, res) {
    logRequestStarted()

    const parsedUrl = url.parse(req.url, true)

    req.GET = parsedUrl.query || {}

    res.json = json
    res.e404 = e404
    res.e400 = e400
    res.e500 = e500
    res.error = error

    res.on('finish', logRequestFinished)

    router(req, res)

    function json (raw, status = 200, {contentType = 'application/json'} = {}) {
      let data

      try {
        data = JSON.stringify(raw)
      } catch (e) {
        data = e.toString()
        status = 500
      }

      res.setHeader('Content-Type', contentType)

      res.statusCode = status
      res.end(data)
    }

    function _exxx (data, status) {
      if (typeof data === 'object') {
        return json(data, status)
      }

      res.statusCode = status
      res.end(data)
    }

    function e400 (data) {
      _exxx(data, 400)
    }

    function e404 (data) {
      _exxx(data, 404)
    }

    function e500 (data) {
      _exxx(data, 500)
    }

    function error (e, status = 500) {
      res.statusCode = 500
      res.end(e)
    }

    function logRequestStarted () {
      log.debug(`${req.method}[INCOMING] ${req.url}`)
    }

    function logRequestFinished () {
      log.info(`${req.method}[${res.statusCode}] ${req.url}`)
    }
  }
}
