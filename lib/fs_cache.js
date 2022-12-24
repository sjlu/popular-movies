const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

const CACHE_FOLDER = path.join(__dirname, '../.cache')

const getKey = function (key) {
  return `${CACHE_FOLDER}/${key}.json`
}

const get = async function (key) {
  await fs.mkdirAsync(CACHE_FOLDER, { recursive: true })
  try {
    const data = await fs.readFileAsync(getKey(key))
    return JSON.parse(data.toString())
  } catch (e) {}
}

const set = async function (key, data) {
  await fs.mkdirAsync(CACHE_FOLDER, { recursive: true })
  await fs.writeFileAsync(getKey(key), JSON.stringify(data))
}

module.exports.wrap = async function (key, fn) {
  const cached = await get(key)
  if (cached) {
    return cached
  }

  const data = await fn()
  await set(key, data)
  return data
}
