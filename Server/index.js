// Fastify server -- run: npm install && node index.js

const Fastify = require("fastify");

const app = Fastify({ logger: true });
const HOST = "0.0.0.0";
const PORT = 8080;

app.get("/", async () => {
  return { message: "Hello from Fastify!", time: new Date().toISOString() };
});

app.listen({ host: HOST, port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
