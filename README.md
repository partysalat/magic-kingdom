

#Setup

## Pi
Use the 64bit version of raspian
After starting, execute

```shell
sudo apt full-upgrade
sudo apt dist-upgrade
```

## Docker
```shell
curl -fsSL https://get.docker.com -o get-docker.sh
chmod +x get-docker.sh
sh ./get-docker.sh
```

## Registry
```shell
sudo docker run -d -p 5000:5000 --restart always --name registry registry:2
```
### Configure insecure registry for your env
See https://docs.docker.com/registry/insecure/

```shell
nano /etc/docker/daemon.json

{
  "insecure-registries" : ["bra:5000"]
}
```

### Install portainer

```shell
sudo docker volume create portainer_data
sudo docker run -d -p 8000:8000 -p 9443:9443 -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:2.11.1
```

### AIY Soundcard
https://github.com/google/aiyprojects-raspbian/blob/aiyprojects/HACKING.md#install-voice-bonnethat-packages
```shell
echo "deb https://packages.cloud.google.com/apt aiyprojects-stable main" | sudo tee /etc/apt/sources.list.d/aiyprojects.list 
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - 
sudo apt-get update 

sudo dtoverlay googlevoicehat-soundcard
echo "dtoverlay=googlevoicehat-soundcard" | sudo tee -a /boot/config.txt

sudo apt-get install -y pulseaudio
sudo mkdir -p /etc/pulse/daemon.conf.d/
echo "default-sample-rate = 48000" | sudo tee /etc/pulse/daemon.conf.d/aiy.conf
sudo sed -i -e "s/^load-module module-suspend-on-idle/#load-module module-suspend-on-idle/" /etc/pulse/default.pa


```

select soundcard in raspi-config -> system options -> audio

Install script dependencies
```shell
sudo apt-get install python3-gst-1.0
pip3 install playsound
```

Create start.sh somewhere
```shell
#!/usr/bin/env bash
nohup python /home/pi/brabutton/script.py &
```
And reference it in the /etc/rc.local with
```shell
su - pi -c /home/pi/brabutton/start.sh &
```
#### NOT WORKING (because voicehat! NOT bonnet thingie)
```shell
echo "deb https://packages.cloud.google.com/apt aiyprojects-stable main" | sudo tee /etc/apt/sources.list.d/aiyprojects.list 
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - 
sudo apt-get update 
sudo apt-get install -y aiy-voicebonnet-soundcard-dkms
```