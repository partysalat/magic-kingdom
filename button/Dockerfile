FROM python:alpine3.15

WORKDIR /app

COPY src ./
RUN apk add --no-cache vlc

RUN pip3 install gpiozero python-vlc
RUN ls -la .

CMD ["python","./script.py"]
