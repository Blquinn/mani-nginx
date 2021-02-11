Nginx install on Ubuntu 20.04 Notes

Add to /etc/apt/sources.list

```
# Nginx
deb http://nginx.org/packages/mainline/ubuntu/ groovy nginx
deb-src http://nginx.org/packages/mainline/ubuntu/ groovy nginx
```

Add key for repo

```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys ABF5BD827BD9BF62
```

Update `sudo apt update`

Install nginx and njs module `sudo apt install nginx nginx-module-njs`

Load njs module in main nginx.conf file:

```
load_module modules/ngx_http_js_module.so;
```
