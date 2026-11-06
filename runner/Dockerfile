FROM node:22-alpine
WORKDIR /runner
RUN npm install --save-exact vitest@4.1.12
COPY vitest.config.mjs /runner/vitest.config.mjs
USER node
ENTRYPOINT ["node", "/runner/node_modules/vitest/vitest.mjs", "run", "--config", "/runner/vitest.config.mjs", "--reporter=json", "--maxWorkers=1", "--no-file-parallelism"]
