from gpiozero import LED, Button
from signal import pause
# import vlc

# p = vlc.MediaPlayer("/home/pi/cantina.mp3")
led = LED(25)
button = Button(23)

enabled = False

def toggleCantina():
    global enabled
    if enabled is True:
        led.off()
        # p.stop()
    else:
        led.on()
        # p.play()
    enabled = not enabled


button.when_pressed = toggleCantina
#button.when_released = toggleCantina

pause()