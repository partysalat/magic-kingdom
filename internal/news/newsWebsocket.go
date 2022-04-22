package news

import (
	"errors"
	"fmt"
	"github.com/fasthttp/websocket"
	"github.com/valyala/fasthttp"
	"log"
	"sync"
)

var upgrader = websocket.FastHTTPUpgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(ctx *fasthttp.RequestCtx) bool {
		return true
	},
}

type Broadcaster struct {
	lock        sync.Mutex
	connections []*websocket.Conn
}

var b = &Broadcaster{}

func (broadcaster *Broadcaster) Add(c *websocket.Conn) {
	broadcaster.lock.Lock()
	broadcaster.connections = append(broadcaster.connections, c)
	broadcaster.lock.Unlock()
}
func (broadcaster *Broadcaster) Broadcast(msg []byte) {

	broadcaster.lock.Lock()
	for i := 0; i < len(broadcaster.connections); i++ {
		connection := broadcaster.connections[i]
		err := broadcaster.writeMessageToConnection(msg, connection)

		if err != nil {
			broadcaster.connections = append(broadcaster.connections[:i], broadcaster.connections[i+1:]...)
			i = i - 1
		}
	}
	broadcaster.lock.Unlock()
}

func (broadcaster *Broadcaster) writeMessageToConnection(msg []byte, connection *websocket.Conn) (err error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("panic occurred:", r)
			err = convertRecoverToError(r)
		}
	}()
	return connection.WriteMessage(websocket.TextMessage, msg)
}
func convertRecoverToError(r interface{}) error {
	switch x := r.(type) {
	case string:
		return errors.New(x)
	case error:
		return x
	default:
		return errors.New(fmt.Sprint(x))
	}
}
func WsHandler(c *fasthttp.RequestCtx) {
	err := upgrader.Upgrade(c, func(conn *websocket.Conn) {
		b.Add(conn)

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				log.Println(err)
				return
			}
		}

	})
	if err != nil {
		log.Printf("Error %s", err.Error())
	}

}
