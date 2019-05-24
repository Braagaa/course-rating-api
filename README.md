# Course Rating API

A Node.js REST API that provides a way for users to review educational 
courses. Users will be able to see a list of courses in a database; add 
courses to the database; and add reviews for a specific course. The database
used is MongoDB.

## Running It
```bash
npm start
```

## Modules Used
- express
- mongoose
- ramda
- basic-auth
- bcrypt
- mocha
- supertest

## Authentication
Basic-Auth was used to authenticate users by the server. bcrypt.js was used
to create hashed passwords and used to compare sent passwords against the 
hashed passwords.

## Route Paths

### /api/users

|Paths|Explanation|
|-|-|
|*GET /api/users*|Returns authenticated user.|
|*POST /api/users*|Creates a user, no content returned.|

### /api/courses

|Paths|Explanation|
|-|-|
|*GET /api/courses*|Returns all courses with "\_id" and "title" properties.|
|*GET /api/courses/:courseId*|Returns all Course properties and related user and review documents for the provided course ID.|
|*POST /api/courses*|Creates a course, no content returned.|
|*PUT /api/courses/:courseId*|Updates a course for specified course ID, returns no content.|
|*POST /api/courses/:courseId/reviews*|Creates a review for the specified course ID, returns no content.|

## Testing
Testing was used with mocha.js and supertest.js.
If you want to run the tests, make sure to seed the database with Documents
by going to the _seed-data_ directory and type the following commands:
```bash
mongoimport --db course-api --collection courses --type=json --jsonArray --file courses.json
mongoimport --db course-api --collection users --type=json --jsonArray --file users.json
mongoimport --db course-api --collection reviews --type=json --jsonArray --file reviews.json
```
If you don't seed the database, some of the test will currently fail, so
make sure to seed it first.

To run the tests type:
```bash
npm test
```

## To-Do

- make tests more reliable without seeding the database as a dependent for some tests
- make a front-end UI
