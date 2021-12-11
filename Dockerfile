FROM golang:1.17.4-alpine3.15

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./
COPY internal ./internal
COPY frontend/build ./frontend/build

RUN go build -o magic-kingdom

EXPOSE 8080

CMD ["./magic-kingdom"]
