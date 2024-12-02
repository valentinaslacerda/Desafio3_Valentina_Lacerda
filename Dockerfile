FROM node:20

COPY . /home/node/app/

RUN chmod +x /home/node/app/entrypoint.sh

ENTRYPOINT ["/home/node/app/entrypoint.sh"]
