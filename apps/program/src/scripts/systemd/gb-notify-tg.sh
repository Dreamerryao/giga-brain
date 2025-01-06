#!/bin/bash
# Get service name and hostname
SERVICE="$1"
HOST=$(hostname)

# Get the last 10 lines of the service's logs
LOGS=$(journalctl -u "$1" -n 10 --no-pager)

# Add debug logging
exec 1> >(logger -s -t $(basename $0)) 2>&1

echo "Starting notification script"
echo "Service: $1"
echo "Bot Token: ${NOTIFY_TG_BOT_TOKEN:0:10}..."
echo "Chat ID: $NOTIFY_TG_CHAT_ID"

# Rest of your script...
# Create message
MESSAGE="🚨 Service Alert on $HOST
Service: $SERVICE
Status: Failed
Time: $(date)

Recent Logs:
$LOGS"

curl -s "https://api.telegram.org/bot${NOTIFY_TG_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${NOTIFY_TG_CHAT_ID}" \
    -d "text=${MESSAGE}" \
    -d "parse_mode=HTML"