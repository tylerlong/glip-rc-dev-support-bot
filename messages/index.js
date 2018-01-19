import RingCentral from 'ringcentral-js-concise'
import Lex from 'aws-sdk/clients/lexruntime'
import Lambda from 'aws-sdk/clients/lambda'

const token = JSON.parse(process.env.GLIP_API_TOKEN)
const rc = new RingCentral('', '', process.env.GLIP_API_SERVER)
rc.token(token)

const lex = new Lex({ region: 'us-east-1' })
const lambda = new Lambda({ region: 'us-east-1' })

export const handleMessage = (event, context, callback) => {
  if (event.headers['Verification-Token'] !== process.env.GLIP_VERIFICATION_TOKEN) {
    callback(null, { statusCode: 404 })
    return
  }
  callback(null, { statusCode: 200, body: '', headers: { 'Validation-Token': event.headers['Validation-Token'] } })
  if (event.body === null) {
    return
  }
  lambda.invoke({
    FunctionName: 'glip-rc-dev-support-bot-messages-dev-processMessage',
    InvocationType: 'Event',
    Payload: JSON.stringify(event)
  }, (error, data) => {
    console.log(error, data)
  })
}

export const processMessage = (event, context, callback) => {
  const body = JSON.parse(event.body)
  console.log(JSON.stringify(body, null, 2))
  const message = body.body
  if (message && message.creatorId !== token.owner_id) {
    lex.postText({
      botAlias: 'order_rose', /* required */
      botName: 'OrderFlowers', /* required */
      inputText: message.text, /* required */
      userId: message.creatorId /* required */
    }, (error, data) => {
      console.log(error, data)
      if (error !== null) {
        return
      }
      if (data.message === null && data.dialogState === 'ReadyForFulfillment') {
        data.message = 'OK'
      }
      rc.post('/restapi/v1.0/glip/posts', {
        groupId: message.groupId,
        text: data.message,
        attachments: undefined
      }).catch(error => {
        console.log(error.response.data)
      })
    })
  }
}
