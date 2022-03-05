

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
sh ./get-docker.sh
```

## Registry
```shell
docker run -d -p 5000:5000 --restart always --name registry registry:2
```
### Configure insecure registry for your env
See https://docs.docker.com/registry/insecure/
