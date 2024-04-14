# esbuild build
FROM library/node:18-alpine as esbuild
WORKDIR /home/node/app 

COPY *.js* ./
COPY *.ts* ./
RUN mkdir /home/node/app/game
COPY game/*.ts* game/

RUN mkdir /home/node/app/site
COPY site/*.ts* site/

# RUN mkdir /home/node/app/site/@types/express
# COPY site/@types/express/*.ts* site/@types/express/

RUN mkdir /home/node/app/site/middleware
COPY site/middleware/*.ts* site/middleware/

RUN npm i
RUN ls -al && npm run build

# node
FROM library/node:18-alpine as node
COPY --from=esbuild /home/node/app/dist/ /home/node/app/dist/
WORKDIR /home/node/app
ENTRYPOINT [ "node", "dist/server.js" ]
EXPOSE 8171