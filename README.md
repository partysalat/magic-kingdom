

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
