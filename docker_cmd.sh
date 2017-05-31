#!/bin/bash

# copy config files from the `shared` directory
# and call `npm run update`

FILES="config.js
claudia.json"

for F in $FILES; do
	cp -avp ${DEPLOYDIR}/shared/${F} ${DEPLOYDIR}/current/
done

npm run update