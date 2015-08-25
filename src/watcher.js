import fs from 'fs'
import {EventEmitter} from 'events'

import chokidar from 'chokidar'
import bole from 'bole'

export default createWatcher

const log = bole('frock/watcher')

function createWatcher (frock, file) {
  const events = new EventEmitter()

  chokidar.watch(file)
    .on('change', onFrockfileChange)

  return events

  function onFrockfileChange (path) {
    fs.readFile(path, (err, config) => {
      let frockfile

      if (err) {
        events.emit('error', err)

        return log.error('Error hot-reloading frockfile', err)
      }

      try {
        frockfile = JSON.parse(config.toString())
      } catch (e) {
        log.error(`Error parsing frockfile: ${e}`, e)

        return
      }

      events.emit('change', frockfile)

      frock.reload(frockfile, () => {
        log.info('Reloaded on frockfile file change')

        events.emit('reload', frockfile)
      })
    })
  }
}
