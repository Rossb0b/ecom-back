# API e-commerce with Node.JS

## Technical spec

* NodeJS 12.16.1
* npm 6.13.4
* Nodemon 1.19

## Development server

There is many steps to follow to setup the API;
  - First, you must set the connexion with your database (I recommend to use MongoDB since the API is developped with mongoose as ORM).
  - Then set your AWS access key and his secret in the aws-config.json file.
  - Finally, create an AWS S3 Bucket and set his name for the const `bucketName`.
  
The API is set, you can now run `npm run start:server` if you are using Nodemon, or `npm run start`

## Possible evolutions

- Adding a Swagger
- Create new branch of the project with a SQL version using typeORM
- Create new branch of the project with a local version (without using S3 buckets) for the NoSQL and the SQL version
