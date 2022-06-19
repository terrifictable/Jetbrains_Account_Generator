#!/bin/sh

while [ true ]
do
    node . single firefox true
    echo "waiting 30secs"
    sleep 30
    echo ""
done
