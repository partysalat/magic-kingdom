from gpiozero import LED, Button
import random
from playsound import playsound
from http.server import BaseHTTPRequestHandler, HTTPServer
from os import listdir
from os.path import isfile, join
import urllib.parse
sound_files_path = "/home/pi/brabutton/sounds/"
sound_files = [f for f in listdir(sound_files_path) if isfile(join(sound_files_path, f))]
# sound_files = [
#     "human1.mp3",
#     "human2.mp3",
#     "human3.mp3",
#     "human4.mp3",
#     "human5.mp3",
#     "human6.mp3",
#     "human7.mp3",
#     "human8.mp3",
#     "human9.mp3",
#     "human10.mp3",
#     "human11.mp3",
#     "human12.mp3",
#     "human13.mp3",
#     "human14.mp3",
#     "human15.mp3",
#     "human16.mp3",
#     "human17.mp3",
#     # "human18.mp3",
#     "human19.mp3",
#     "orcs1.mp3",
#     "orcs2.mp3",
#     "orcs3.mp3",
#     "orcs4.mp3",
#     "orcs5.mp3",
#     "orcs6.mp3",
#     "orcs7.mp3",
#     "orcs8.mp3",
#     "orcs9.mp3",
#     "orcs10.mp3",
#     "orcs11.mp3",
# ]
led = LED(25)
button = Button(23)

enabled = False

def toggleCantina(sound_file):

    global enabled
    if enabled is False:
        led.on()

        playsound("/home/pi/brabutton/sounds/" + sound_file)
        led.off()
        enabled = False

def randomSound():
    toggleCantina(random.choice(sound_files))

button.when_pressed = randomSound

def withBrackets(n):
    return "\"" + n + "\""

class MyServer(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(bytes("[", "utf-8"))
        self.wfile.write(bytes(",".join(map(withBrackets, sound_files)), "utf-8"))
        self.wfile.write(bytes("]", "utf-8"))
        # self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        # self.wfile.write(bytes("<body>", "utf-8"))
        # self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        # self.wfile.write(bytes("</body></html>", "utf-8"))
    def do_POST(self):
        self.send_response(204)
        # self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        toggleCantina(urllib.parse.unquote(self.path.split("/")[-1]))
        # self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        # self.wfile.write(bytes("<body>", "utf-8"))
        # self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        # self.wfile.write(bytes("</body></html>", "utf-8"))
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST,GET")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Max-Age", "86000")
        self.end_headers()
        # self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        # self.wfile.write(bytes("<body>", "utf-8"))
        # self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        # self.wfile.write(bytes("</body></html>", "utf-8"))

if __name__ == "__main__":
    hostname = "0.0.0.0"
    port = 5002
    webServer = HTTPServer((hostname, port), MyServer)
    print("Server started http://%s:%s" % (hostname, port))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
