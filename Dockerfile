# שלב 1: בנייה עם Node
FROM node:20 AS builder

WORKDIR /app
COPY . .

# בניית אפליקציית Angular
RUN npm install && npm run build --configuration production

# שלב 2: הפצה עם Nginx
FROM nginx:alpine

# הסר את דף ברירת המחדל של nginx
RUN rm -rf /usr/share/nginx/html/*

# העתק את קבצי הבנייה
COPY --from=builder /app/dist/portfolio /usr/share/nginx/html

# (רשות) אם יש לך nginx.conf, העתק אותו:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
