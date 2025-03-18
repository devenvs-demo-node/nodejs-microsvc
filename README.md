# Nodejs Microservice Project
Nodejs Microservice project

# Reference
**YouTube Links**
1. Understanding Microservice Project with Architecture and migrating from monolithic to microservice architecture
Link: [1st Video of Playlist](https://www.youtube.com/watch?v=EXDkgjU8DDU&list=PLaLqLOj2bk9ZV2RhqXzABUP5QSg42uJEs&index=1&pp=iAQB)
2. Understanding Customer service
Link: [2nd Video of the Playlist](https://www.youtube.com/watch?v=-reuug_7iG0&list=PLaLqLOj2bk9ZV2RhqXzABUP5QSg42uJEs&index=2&pp=iAQB)
3. Understanding Product and Shopping Service
Link: [3rd Video of the Playlist](https://www.youtube.com/watch?v=T-xCylkjSf8&list=PLaLqLOj2bk9ZV2RhqXzABUP5QSg42uJEs&index=4&pp=iAQB)

**Repository Link**

[Link to Backend Microservice](https://github.com/codergogoi/nodejs_microservice)

[Link to Frontend Microservice](https://github.com/devarsh10/microservice-frontend)

**Postman Collection**
[JSON File](https://github.com/codergogoi/Grocery_Online_Shopping_App/blob/master/online_shopping_monolithic/Microservices%20Tutorial.postman_collection.json)

# Understanding Project

1. We have three microservices as of now.

   i.  Customer Service
   
   ii. Shopping Service

   iii. Product Service

3. Diving inside the directory of customer service. I have modified the file, mentioned as below,

   i. Created a .dockerignore file to ignore node_modules file while building the image
   
   ii. Added a instrumentation.js file and replace localhost with otel-collector(the name of container)

   iii. In package.json add required packages used in instrumentation.js and added this(`"start": NODE_ENV=prod node --require ./instrumentation.js src/index.js`) line in which we're specifying `--require ./instrumentation.js`. Now, when we run `npm start`, the command will run and our app will be up and running.

   iv. In Dockerfile, I have replaced Image from 'node' to 'node:20-alpine'

   v. Made changes in docker-compose file, added few services like otel-collector, grafana, tempo and init, prometheus and finally, kept them into one virtual network.

I've made above mentioned changes in products and shopping service.

   TODO: 1. Change the name of the virtual network
         2. One more network is getting created when we run `docker-compose up -d` nodejs_microservice_default which is not suppose to get created. So, make sure it does not get created. Cause: This virtual network might be associated with customer, product and shopping service.

3. Also, I have created the shared directory in which I have prometheus.yaml(it is the config file for prometheus) and grafana-datasource.yaml(so that we do not have to attach the data source everytime we boot up the grafana)

# Hands-On

0. Go to the directory, nodejs_microservice
1. Run `docker-compose up -d`
2. Now, all services must be running.
3. Import the Postman json linked above. In the Postman, Go to customer, send sign up request, send log in request, copy the bearer token and paste it in the parent folder(named Microservices Tutorial) of customer, shopping and products. Now, send request and check trace the request from Grafana Tempo.
4. Refer this video link: [Part-1](https://drive.google.com/file/d/1JTPJtI-sXj-e4WwTjumI1WgRdJMjSgPd/view?usp=sharing) [Part-2](https://drive.google.com/file/d/18cNRTacxncecE79U9AuRMOKSZmuW_FX9/view?usp=sharing)

## In the Backend

1. Once, we run the docker-compose command, all the service will boot up.
2. The customer, products, shopping, nginx-proxy, rabbitmq, mongodb will start playing the key-role.
3. **IMP**: init container will initialize and give the access to tempo to access the tempo-data directory on our local machine, so that it can save the tempo data to this directory.
4. Now, the remaining services, such as, tempo, prometheus and grafana will play their individual role.

# Troubleshooting

1. I have faced issue, while I was build the image based on the Dockerfile. But the 'npm install' step was taking too much of time. Maybe, because of my PC.
2. So, I have build the image from the codespaces and push the image to my DockerHub Account.
   
