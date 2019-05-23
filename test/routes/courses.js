const supertest = require('supertest');
const R = require('ramda');

const app = require('../../src/index');
const {User, Course, Review} = require('../../src/models/');
const {propEq, onlyHasProps} = require('../../src/modules/assertions');

const result = done => (err, res) => {
    if (err) return done(err);
    return done();
};

const course = {
    title: 'Statistics',
    description: 'Statistics is a field that provides the foundations and techniques to collect, analyze, and present information in an effective and efficient manner.',
};

const user = {
    fullName: 'Michael Braga',
    emailAddress: 'test@outlook.com',
    password: 'abc123'
};

const guy = {
    fullName: 'Brago',
    emailAddress: '123@fake.com',
    password: 'abc123'
};

const review = {
    rating: 5,
    review: 'wow'
};

app.set('env', 'test');

let server;
let user2;
let user3;

describe('POST /api/courses', function(done) {
    before(function() {
        return Promise.all([User.create(user), User.create(guy)])
            .then(([u1, u2]) => {
                user2 = u1;
                user3 = u2;
            })
            .then(() => server = app.listen(app.get('port'), done))
            .catch(console.error);
    });

    it("returns a successful 201 response and Location header at '/' with proper authentication", function(done) {
        supertest(app)
            .post('/api/courses')
            .send({
                ...course,
                estimatedTime: '4 years'
            })
            .auth(user.emailAddress, user.password)
            .expect(201)
            .expect('Location', '/')
            .end(result(done));
    });

    it("returns a 422 if required fields aren't found", function(done) {
        supertest(app)
            .post('/api/courses')
            .send({steps: [{}]})
            .auth(user.emailAddress, user.password)
            .expect(propEq('message', 'Course validation failed'))
            .expect(onlyHasProps(['errors'], ['title', 'description', 'steps.0.title', 'steps.0.description']))
            .expect(422)
            .end(result(done));
    });

    it('returns a 422 if a string tries to passed as a number for Course.steps.0.stepNumber', function(done) {
        supertest(app)
            .post('/api/courses')
            .send({
                ...course,
                steps: [{title: 'Easy Pz', description: 'Nothing', stepNumber: 'error'}]
            })
            .auth(user.emailAddress, user.password)
            .expect(propEq('message', 'Course validation failed'))
            .expect(onlyHasProps(['errors'], ['steps.0.stepNumber']))
            .expect(422)
            .end(result(done));
    });

    it('returns a 401 (no Authorization header)', function(done) {
        supertest(app)
            .post('/api/courses')
            .send(course)
            .expect(401, {
                message: 'Failed to authenticate.',
                errors: {}
            })
            .end(result(done));
    });
});

describe('GET /api/courses', function() {
    it('returns a JSON 200 response with array of all Course Documents', function(done) {
        supertest(app)
            .get('/api/courses')
            .expect(onlyHasProps([0], ['_id', 'title']))
            .expect(200)
            .end(result(done));
    });
});

describe('GET /api/courses/:courseId', function() {
    it('returns 200 with appropriate Course Document', function(done) {
        Course.findById('57029ed4795118be119cc43d', {__v: 0})
            .exec()
            .then(course => {
                supertest(app)
                    .get(`/api/courses/${course._id}`)
                    .expect(onlyHasProps(['user'], ['_id', 'fullName']))
                    .expect(onlyHasProps(['reviews', 0, 'user'], ['_id', 'fullName']))
                    .expect(200)
                    .end(result(done));
            });
            
    });
    
    it('returns 404 when id is invalid', function(done) {
        supertest(app)
            .get('/api/courses/doesnotwork')
            .expect(404, {
                message: 'Course could not be found.',
                errors: {}
            })
            .end(result(done));
    });

    it('returns 404 when id does not match a Course Document in the database', function(done) {
        supertest(app)
            .get('/api/courses/57029ed4795118be119cc41e')
            .expect(404, {
                message: 'Course could not be found.',
                errors: {}
            })
            .end(result(done));
    });
});

describe('PUT /api/courses/:courseId', function() {
    it('returns 204 when Course Document successfully updates', function(done) {
        Course.create({title: course.title, description: course.description, user: user2._id})
            .then(course => {
                supertest(app)
                    .put(`/api/courses/${course._id}`)
                    .send({
                        title: 'New Title',
                        description: 'New description',
                    })
                    .auth(user2.emailAddress, user.password)
                    .expect(204)
                    .end((err, res) => {
                        if (err) return done(err);
                        Course.deleteOne({_id: course._id})
                            .then(() => done());
                    });
            });
    });
    
    it('returns 422 when there are validation errors found', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .put(`/api/courses/${course._id}`)
                    .send({steps: [{}]})
                    .auth(user.emailAddress, user.password)
                    .expect(propEq('message', 'Validation failed'))
                    .expect(onlyHasProps(['errors'], ['steps.0.description', 'steps.0.title']))
                    .expect(422)
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 422 when there are cast errors for steps.stepNumber', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .put(`/api/courses/${course._id}`)
                    .send({steps: [{stepNumber: 'a', title: 'hi', description: 'bye'}]})
                    .auth(user.emailAddress, user.password)
                    .expect(422, {
                        message:  "Cast to embedded failed for value \"{ stepNumber: \\'a\\', title: \\'hi\\', description: \\'bye\\' }\" at path \"steps\"",
                        errors: {}
                    })
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 403 if user tries to update a course they did not create', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .put(`/api/courses/${course._id}`)
                    .send({})
                    .auth(guy.emailAddress, guy.password)
                    .expect(403, {
                        message: "Can only update user's created courses.",
                        errors: {}
                    })
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 401 (no auth header)', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .put(`/api/courses/${course._id}`)
                    .send({})
                    .expect(401, {
                        message: 'Failed to authenticate.',
                        errors: {}
                    })
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });
});

describe('POST /api/courses/:courseId/reviews', function() {
    it('returns 201 if Review is successfully added to the database', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send(review)
                    .auth(user3.emailAddress, guy.password)
                    .expect('Location', `/api/courses/${course.id}`)
                    .expect(201)
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 422 if a user tries to review their own course', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send(review)
                    .auth(user.emailAddress, user.password)
                    .expect(422, {
                        message: 'You cannot review your own course.',
                        errors: {}
                    })
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 422 if rating for review is less then min required', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send({...review, rating: 0})
                    .auth(guy.emailAddress, guy.password)
                    .expect(propEq('message', 'Review validation failed'))
                    .expect(onlyHasProps(['errors'], ['rating']))
                    .expect(422)
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 422 if rating for review is more then max required', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send({...review, rating: 6})
                    .auth(guy.emailAddress, guy.password)
                    .expect(propEq('message', "Review validation failed"))
                    .expect(onlyHasProps(['errors'], ['rating']))
                    .expect(422)
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 422 cast error if rating is not a number', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send({...review, rating: 'k'})
                    .auth(guy.emailAddress, guy.password)
                    .expect(propEq('message', 'Review validation failed'))
                    .expect(onlyHasProps(['errors'], ['rating']))
                    .expect(422)
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    it('returns 401 (no auth header)', function(done) {
        Course.create({title: 'test', description: 'test', user: user2._id})
            .then(course => {
                supertest(app)
                    .post(`/api/courses/${course._id}/reviews`)
                    .send(review)
                    .expect(401, {
                        message: 'Failed to authenticate.',
                        errors: {}
                    })
                    .end((err, res) => {
                        Course.deleteOne({_id: course._id})
                            .then(() => Review.deleteOne(review))
                            .then(() => {
                                if (err) return done(err);
                                return done();
                            });
                    });
            });
    });

    after(function() {
        return Promise.all([
            User.deleteOne({emailAddress: user.emailAddress}),
            User.deleteOne({emailAddress: guy.emailAddress}),
            Course.deleteOne({title: course.title})
        ])
            .then(() => Course.deleteOne({title: course.title}))
            .then(() => server.close())
            .catch(console.error);
    });
});
