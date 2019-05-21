const supertest = require('supertest');
const R = require('ramda');

const app = require('../../src/index');
const {User, Course} = require('../../src/models/');
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

app.set('env', 'test');

let server;

describe('POST /api/courses', function(done) {
    before(function() {
        return Promise.all([User.create(user)])
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

describe('/GET /api/courses/:courseId', function() {
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
    
    it ('returns 404 with null when id is invalid or id does not exist', function(done) {
        supertest(app)
            .get('/api/courses/doesnotwork')
            .expect(404, {
                message: 'Course could not be found.',
                errors: {}
            })
            .end(result(done));
    });
    
    after(function() {
        return Promise.all([
            User.deleteOne({emailAddress: user.emailAddress}),
            Course.deleteOne({title: course.title})
        ])
            .then(() => Course.deleteOne({title: course.title}))
            .then(() => server.close())
            .catch(console.error);
    })
});
