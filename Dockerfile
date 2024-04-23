FROM node:18
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
EXPOSE 3000

# Command to run your app using Node.js
RUN npm install pm2 -g
# RUN npm install bcrypt
# Start your app with PM2
CMD ["pm2-runtime", "app.js"]