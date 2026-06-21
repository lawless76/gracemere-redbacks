# GitHub Actions runs `npm install` and `npm run build` before
# building this image, so dist/ is already in the build context.
# Docker just needs to copy it into Nginx — no Node required here.
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
