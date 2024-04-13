# esbuild build
FROM library/node:18-alpine as esbuild
WORKDIR /home/node/app 
# fake computer directory above

COPY *.js* ./
COPY *.ts* ./
RUN mkdir /home/node/app/game
COPY game/*.ts* game/

# above just depends on the directory paths

RUN npm i
RUN ls -al && npm run build

# node
FROM library/node:18-alpine as node
COPY --from=esbuild /home/node/app/dist/ /home/node/app/dist/
WORKDIR /home/node/app
ENTRYPOINT [ "node", "dist/server.js" ]
EXPOSE 8171

# combine game and site servers
# make sure npm run build in ui/ works
# 