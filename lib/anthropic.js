const Anthropic = require('@anthropic-ai/sdk')
const config = require('../config')

const client = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY
})

module.exports.prompt = async function (system, content) {
  const response = await client.messages.create({
    max_tokens: 4096,
    system,
    messages: [{
      role: 'user',
      content
    }],
    temperature: 0.0,
    model: 'claude-3-5-sonnet-latest'
  })

  console.log(response)

  const lines = response.content[0].text.split('\n').map(line => line.trim())

  const bodyStartIndex = lines.findIndex(line => line === '```json' || line === '```')
  if (bodyStartIndex === -1) {
    throw new Error('Response does not contain a code block')
  }

  const bodyEndIndex = lines.indexOf('```', bodyStartIndex + 1)
  if (bodyEndIndex === -1) {
    throw new Error('Response does not contain a closing code block')
  }

  const data = JSON.parse(lines.slice(bodyStartIndex + 1, bodyEndIndex).join('\n').trim())
  return data
}
