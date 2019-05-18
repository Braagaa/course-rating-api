const supertest = require('supertest');

const app = require('../../src/index');
const {User, Course} = require('../../src/models/');

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
        return User.create(user)
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
            .expect(422, {
                message: 'Course validation failed',
                errors: {
                    title: 'Title is required.',
                    description: 'Description is required.',
                    "steps.0.title": 'Title for steps required.',
                    "steps.0.description": "Description for steps required."
                }
            })
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
            .expect(422, {
                message: 'Course validation failed',
                errors: {
                    "steps.0.stepNumber": "Cast to Number failed for value \"error\" at path \"stepNumber\""
                }
            })
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

    after(function() {
        return User.deleteOne({emailAddress: user.emailAddress})
            .then(() => Course.deleteOne({title: course.title}))
            .then(() => server.close())
            .catch(console.error);
    })
});
