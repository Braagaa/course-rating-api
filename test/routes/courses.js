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

describe('POST /api/courses', function() {
    before(function() {
        return User.create(user)
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
            .catch(console.error);
    })
});
