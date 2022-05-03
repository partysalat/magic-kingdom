from gpiozero import LED, Button
from signal import pause
import random
from playsound import playsound
# import vlc
sound_files = [
    "human1.mp3",
    "human2.mp3",
    "human3.mp3",
    "human4.mp3",
    "human5.mp3",
    "human6.mp3",
    "human7.mp3",
    "human8.mp3",
    "human9.mp3",
    "human10.mp3",
    "human11.mp3",
    "human12.mp3",
    "human13.mp3",
    "human14.mp3",
    "human15.mp3",
    "human16.mp3",
    "human17.mp3",
    # "human18.mp3",
    "human19.mp3",
    "orcs1.mp3",
    "orcs2.mp3",
    "orcs3.mp3",
    "orcs4.mp3",
    "orcs5.mp3",
    "orcs6.mp3",
    "orcs7.mp3",
    "orcs8.mp3",
    "orcs9.mp3",
    "orcs10.mp3",
    "orcs11.mp3",
]
led = LED(25)
button = Button(23)

enabled = False

def toggleCantina():

    global enabled
    if enabled is False:
        led.on()

        playsound("/home/pi/brabutton/sounds/"+random.choice(sound_files))
        led.off()
        enabled = False


button.when_pressed = toggleCantina
#button.when_released = toggleCantina

pause()