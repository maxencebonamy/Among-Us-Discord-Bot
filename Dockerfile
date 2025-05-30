FROM node:19

# Set workdir:
WORKDIR /usr/src/app

# Install required libs for node canvas:
RUN apt-get update && apt-get install -y libuuid1 libgl1-mesa-dev

# Install deps:
COPY package*.json ./
RUN npm install

# Run migrations:
COPY prisma ./prisma/
RUN npx prisma generate

# Copy all files:
COPY . .
RUN npx prisma db push

CMD npm run start