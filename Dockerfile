# 1️⃣ Use Node 22
FROM node:22-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy source code
COPY . .

# 6️⃣ Build TypeScript
RUN npm run build

# 7️⃣ Expose port
EXPOSE 5000

# 8️⃣ Run compiled file
CMD ["node", "dist/server.js"]
