# Asqa Telegram Integration (Bot)

## TODO
- [X] Bot registered: http://t.me/AsqaBot
- [X] Telegraf + Kafka implemented
- [X] Dockerfile
## Required variables
```
TELEGRAM_BOT_API_KEY=<>
KAFKA_BOOTSTRAP_SERVER=127.0.0.1:9092
MESSAGE_FROM_USER_TOPIC=message.from.user.v1
SEND_TO_USER_TOPIC=message.to.user.v1
```
## Optional variables
```
KAFKA_USERNAME=user
KAFKA_PASSWORD=password
```