# שלב 1: בניית אפליקציית Angular
FROM node:18 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production --project=portfolio

# שלב 2: שרת NGINX
FROM nginx:alpine

# העתק את ה־dist שנבנה אל תיקיית ברירת המחדל של nginx
COPY --from=build /app/dist/portfolio /usr/share/nginx/html

# נוכל להוסיף קובץ nginx.conf כאן אם צריך (לנתיבים)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
