FROM golang:1.21 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /saephrix ./backend/cmd

FROM gcr.io/distroless/static
COPY --from=build /saephrix /saephrix
ENV SAEPHRIX_ADDR=0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["/saephrix"]
