# api-rate-limit-nodejs-poc
A poc for implementation of "Sliding Window Counter" algorithm for limiting API calls in nodeJS using "express-rate-limit" and redis

1) Clone this repository
2) npm i --save
3) Install Redis(https://redis.io/download) on your system
4) Start Redis server
5) Set WINDOW_SIZE_IN_HOURS to the number of hours of the window, MAX_WINDOW_REQUEST_COUNT as the max number of api calls within WINDOW_SIZE_IN_HOURS duration 
   in the file app/modules/books/middleware/rateLimiter.js
6) Start node server
7) In Postman, fire a GET API to 'http://localhost:8080/api/booksAPI/books_routes/books' and check the results. 
