## **Deploy instructions**



Copy the contents of this repository in a folder on disk. Then run the commands bellow to start the docker application.



Application is running inside docker containers, run commands below to start each container.



#### **Backend**



1\. Go to **backend** folder and run command:


```
docker compose up -d --build
```


2\. Run scripts for database setup and random data generator:


```
docker compose exec backend php /var/www/html/demo/initDatabase.php

docker compose exec backend php /var/www/html/demo/createDemoData.php
```


3\. The backend is now running on localhost:8080



#### **Frontend**



1\. Go to **frontend** folder and run command:


```
docker compose up -d --build
```


2\. The frontend is now running on localhost:80


	


If everything went without error, the application is available at http://localhost/

