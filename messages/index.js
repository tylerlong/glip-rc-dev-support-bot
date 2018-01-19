import RingCentral from 'ringcentral-js-concise'
import Lex from 'aws-sdk/clients/lexruntime'

const token = JSON.parse(process.env.GLIP_API_TOKEN)
const rc = new RingCentral('', '', process.env.GLIP_API_SERVER)
rc.token(token)

const lex = new Lex({ region: 'us-east-1' })

export const handleMessage = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2))
  if (event.headers['Verification-Token'] !== process.env.GLIP_VERIFICATION_TOKEN) {
    callback(null, { statusCode: 404 })
    return
  }
  callback(null, { statusCode: 200, body: '', headers: { 'Validation-Token': event.headers['Validation-Token'] } })
  if (event.body === null) {
    return
  }
  const message = JSON.parse(event.body).body
  if (message && message.creatorId !== token.owner_id) {
    lex.postText({
      botAlias: 'order_rose', /* required */
      botName: 'OrderFlowers', /* required */
      inputText: message.text, /* required */
      userId: message.creatorId /* required */
    }, (error, data) => {
      console.log(error, data)
      if (error != null) {
        return
      }
      rc.post('/restapi/v1.0/glip/posts', {
        groupId: message.groupId,
        text: data.message,
        attachments: undefined
      })
    })
  }
}
