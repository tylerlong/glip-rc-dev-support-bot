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
  const message = JSON.parse(event.body).body
  console.log(message.text)
  if (message.creatorId === token.owner_id) {
    return
  }
  lambda.invoke({
    FunctionName: 'glip-rc-dev-support-bot-messages-dev-processMessage',
    InvocationType: 'Event', // so `lambda.invoke` is async
    Payload: JSON.stringify({ message })
  }, (error, data) => {
    if (error !== null) {
      console.log(error, data)
    }
  })
}

export const processMessage = (event, context, callback) => {
  const message = event.message
  console.log(message.text)
  lex.postText({
    botAlias: 'order_rose', /* required */
    botName: 'OrderFlowers', /* required */
    inputText: message.text, /* required */
    userId: message.creatorId /* required */
  }, (error, data) => {
    if (error !== null) {
      console.log(error, data)
      return
    }
    console.log(JSON.stringify(data, null, 2))
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
