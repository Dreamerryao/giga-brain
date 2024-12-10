#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")
KEYS_DIR="$SCRIPT_DIR/keys"

# Check if keys directory exists
if [ ! -d "$KEYS_DIR" ]; then
    echo "Error: 'keys' directory not found at $KEYS_DIR"
    exit 1
fi

# Amount to send (in SOL)
AMOUNT=0.1

# Get default key balance first
DEFAULT_BALANCE=$(solana balance | awk '{print $1}')
echo "Default key balance: $DEFAULT_BALANCE SOL"

# Calculate required total (number of keys * 0.1 SOL)
NUM_KEYS=$(ls "$KEYS_DIR"/*.json 2>/dev/null | wc -l)
TOTAL_NEEDED=$(echo "$NUM_KEYS * $AMOUNT" | bc)
echo "Found $NUM_KEYS keys, need $TOTAL_NEEDED SOL total"

# Check if we have enough balance
if (( $(echo "$DEFAULT_BALANCE < $TOTAL_NEEDED" | bc -l) )); then
    echo "Error: Insufficient balance. Need $TOTAL_NEEDED SOL but have $DEFAULT_BALANCE SOL"
    exit 1
fi

# Loop through each key file in the keys directory
for keyfile in "$KEYS_DIR"/*.json; do
    if [ -f "$keyfile" ]; then
        # Get recipient address
        RECIPIENT=$(solana address -k "$keyfile")
        echo -e "\nProcessing $keyfile ($RECIPIENT)"
        
        # Send transaction
        echo "Sending $AMOUNT SOL..."
        solana transfer --allow-unfunded-recipient "$RECIPIENT" $AMOUNT
        
        # Show new balance
        echo "New balance for $keyfile:"
        solana balance -k "$keyfile"
    fi
done

# Show remaining balance of default key
echo -e "\nRemaining default key balance:"
solana balance