import RingCentral from 'ringcentral-js-concise'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const env = yaml.load(fs.readFileSync(path.join(__dirname, '../messages/env.yml'), 'utf-8'))
const rc = new RingCentral('', '', env.dev.GLIP_API_SERVER)
rc.token(JSON.parse(env.dev.GLIP_API_TOKEN))

rc.get('/restapi/v1.0/subscription').then(r => {
  console.log(JSON.stringify(r.data, null, 2))
}).catch(error => {
  console.log(error.response.data)
})
