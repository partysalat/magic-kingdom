#!/usr/bin/env bash

MM_CONFIG_DIR=/home/pi/magic_mirror/config

zip -r frontend.zip build
scp frontend.zip pi@bra:${MM_CONFIG_DIR}/braccounting/frontend.zip

#DIR="$( cd ../"$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#ssh pi@bra 'bash -s' < $DIR/expandFrontend.sh

# upload config
# upload frontend files
# upload backend docker