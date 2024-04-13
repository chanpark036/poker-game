# for mongodb setup
Running Mongo server -- either via Docker:

```bash
docker run --rm -d -p 27017:27017 --name mongo mongo
```

Setting up mongodb
```bash
npm run setup
```

# for login setup:

You need a `server/secrets.ts` file with the info:
export const gitlab = {
    client_id: ____your___client_id______
    client_secret: ____your___client_secret_____
  }

and the following redirect URI's registered in GitLab.
http://127.0.0.1:8100/api/login-callback
http://localhost:8100/api/login-callback

# for running server:

for site part
```bash
npm run serve
```

for game part
```bash
npm run start
```