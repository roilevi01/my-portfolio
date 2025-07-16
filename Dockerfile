# שלב 1: בניית אפליקציית Angular
FROM node:20 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production --project=portfolio

# שלב 2: NGINX לאחסון האתר
FROM nginx:alpine

# העתק את התוכן הבנוי מהשלב הקודם
COPY --from=build /app/dist/portfolio /usr/share/nginx/html

# פתיחת פורט
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
