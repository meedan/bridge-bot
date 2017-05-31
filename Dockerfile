# meedan/bridge-bot

FROM meedan/nodejs
MAINTAINER sysops@meedan.com

ENV DEPLOYUSER=bridgedeploy \
    DEPLOYDIR=/app \
    GITREPO=git@github.com:meedan/bridge-bot.git \
    PRODUCT=bridge \
    APP=bridge-bot \
    NODE_ENV=production

# user config
RUN useradd ${DEPLOYUSER} -s /bin/bash -m \
    && mkdir -p /home/${DEPLOYUSER}/.aws \
    && chown -R ${DEPLOYUSER}:${DEPLOYUSER} /home/${DEPLOYUSER}

RUN npm install -g claudia \
    && mkdir -p ${DEPLOYDIR}/latest

WORKDIR ${DEPLOYDIR}/latest
COPY package.json ${DEPLOYDIR}/latest/package.json
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}
USER ${DEPLOYUSER}
RUN npm install

# copy in the code and move it into the same directory as the built node_modules
COPY . ${DEPLOYDIR}/new
USER root
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}/new
USER ${DEPLOYUSER}
RUN rm -rf ${DEPLOYDIR}/new/node_modules \
    && rsync -avp ${DEPLOYDIR}/new/* ${DEPLOYDIR}/latest/

# link config files
RUN ln -s ${DEPLOYDIR}/shared/config.js ${DEPLOYDIR}/latest/config.js \
    && ln -s ${DEPLOYDIR}/shared/claudia.json ${DEPLOYDIR}/latest/claudia.json \
    && ln -s ${DEPLOYDIR}/shared/aws /home/${DEPLOYUSER}/.aws 

WORKDIR ${DEPLOYDIR}
RUN mv ./latest ./${APP}-$(date -I) && ln -s ./${APP}-$(date -I) ./current
WORKDIR ${DEPLOYDIR}/current
CMD ["npm run update"]