#!/usr/bin/env bash

MM_CONFIG_DIR=/home/pi/magic_mirror/config

cd frontend
npm run build
zip -r frontend.zip build
scp frontend.zip pi@farnsworth:${MM_CONFIG_DIR}/braccounting/frontend.zip

#DIR="$( cd ../"$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#ssh pi@farnsworth 'bash -s' < $DIR/expandFrontend.sh

# upload config
# upload frontend files
# upload backend docker