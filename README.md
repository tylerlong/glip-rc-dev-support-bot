# glip-rc-dev-support-bot

A developer support chatbot for RingCentral running inside Glip.


## Setup

```
yarn install

cd messages
cp env.sample.yml env.yml
edit env.yml
```


## Deploy

### Full deploy

    yarn deploy:full

### Quick deploy

    yarn deploy

### Deploy to production

    yarn deploy:full:prod


## Service information

    yarn run info


## Log information

    yarn run log

Or check log in realtime:

    yarn run log:stream


## Remove the service

    yarn run remove
