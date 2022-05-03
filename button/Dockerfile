# NOT USED AND NOT WORKING!
#FROM python:alpine3.15
FROM python:3.7.13-slim-bullseye

WORKDIR /app

COPY src ./
COPY sounds ./sounds
#RUN apk add --no-cache gstreamer cairo-dev
#RUN apk add --no-cache gstreamer python3-gi python3-gi-cairo gir1.2-gtk-3.0
#libgirepository1.0-dev  python3-gi python3-gi-cairo gir1.2-gtk-3.0

RUN apt-get update
RUN apt-get install python3-gi python3-gi-cairo gir1.2-gtk-3.0 python3-gst-1.0 gcc gstreamer-1.0 -y

#RUN apt-get install libgirepository1.0-dev gcc libcairo2-dev pkg-config python3-dev gir1.2-gtk-3.0
RUN pip3 install gpiozero playsound RPi.GPIO pygobject

CMD ["python","./script.py"]
