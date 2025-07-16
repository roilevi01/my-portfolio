# שלב הבנייה
FROM node:20-alpine as build

WORKDIR /app
COPY . .
RUN npm install && npm run build --configuration production

# שלב ההרצה עם Nginx
FROM nginx:alpine
COPY --from=build /app/dist/portfolio /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
