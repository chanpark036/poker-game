# vite build
FROM library/node:18-alpine as node
WORKDIR /home/node/app
COPY *.js* ./

# RUN mkdir /home/node/app/src
# COPY src/*.ts* src/
# COPY src/*.vue* src/

# RUN mkdir /home/node/app/src/components
# COPY src/components/*.vue* src/components/

# RUN mkdir /home/node/app/src/views
# COPY src/views/*.vue* src/views/

RUN npm i
COPY *.ts ./
COPY index.html ./
COPY src ./src
RUN ls -al && npm run build

# nginx
FROM library/nginx:alpine
COPY --from=node /home/node/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf