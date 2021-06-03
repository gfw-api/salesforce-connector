FROM node:12-alpine
MAINTAINER info@vizzuality.com

ENV NAME salesforce-connector
ENV USER salesforce-connector

RUN apk update && apk upgrade && \
    apk add --no-cache --update bash git openssh python alpine-sdk

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

RUN yarn global add --unsafe-perm bunyan

RUN mkdir -p /opt/$NAME
COPY package.json /opt/$NAME/package.json
COPY yarn.lock /opt/$NAME/yarn.lock
RUN cd /opt/$NAME && yarn

COPY entrypoint.sh /opt/$NAME/entrypoint.sh
COPY tsconfig.json /opt/$NAME/tsconfig.json
COPY config /opt/$NAME/config
COPY ./src /opt/$NAME/src
COPY ./test opt/$NAME/test
COPY ./microservice opt/$NAME/microservice

WORKDIR /opt/$NAME

RUN chown -R $USER:$USER /opt/$NAME
RUN chmod a+x /opt/$NAME/entrypoint.sh

# Tell Docker we are going to use this ports
EXPOSE 9500
USER $USER

ENTRYPOINT ["./entrypoint.sh"]
