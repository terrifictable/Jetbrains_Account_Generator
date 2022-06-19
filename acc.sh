#!/bin/sh

delay=30
headless=true
while [ $# -gt 0 ] 
do
    case "$1" in
        -delay)
            export delay=$2
            shift 2;;
        -headless)
            export headless=$2
            shift 2;;
        *)
    continue
    esac
done

echo "Settings for account gen"
echo "===================="
echo "Headless: $headless"
echo "Delay: $delay s"
echo ""
echo "Change delay and/or headless:" 
echo "./acc.sh [-delay: *num*] [-headless: true | false]"
echo "===================="
echo ""


while [ true ]
do
    node . single firefox $headless
    echo "waiting $delay secs"
    sleep $delay
    echo ""
done
