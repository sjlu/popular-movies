const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

const CACHE_FOLDER = path.join(__dirname, '../.cache')

const getKey = function (key) {
  return `${CACHE_FOLDER}/${key}.json`
}

module.exports.get = async function (key) {
  await fs.mkdirAsync(CACHE_FOLDER, { recursive: true })
  try {
    const data = await fs.readFileAsync(getKey(key))
    return JSON.parse(data.toString())
  } catch (e) {
    console.log(e)
  }
}

module.exports.set = async function (key, data) {
  await fs.mkdirAsync(CACHE_FOLDER, { recursive: true })
  await fs.writeFileAsync(getKey(key), JSON.stringify(data))
}
