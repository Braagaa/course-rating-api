const supertest = require('supertest');
const R = require('ramda');

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

const getResPath = R.useWith(R.path, [R.concat(['body']), R.identity]);

const testProp = (path, pred, message) => res => {
    const obj = getResPath(path, res);
    if (!pred(obj)) throw new Error(message);
};

const hasProps = (path, props, message) => res => {
    const obj = getResPath(path, res);
    props.forEach(prop => {
        if (!(prop in obj))
            throw new Error(message);
    });
};

const keysEqual2 = R.pipe(R.keys, R.length, R.equals(2));

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
});

describe('GET /api/courses', function() {
    it('returns a JSON 200 response with array of all Course Documents', function(done) {
        supertest(app)
            .get('/api/courses')
            .expect(res => {
                if (course.length > 0) {
                    const course = res.body[0];
                    if (!('title' in course) || !('_id' in course)) {
                        throw new Error('Wrong Step document found.');
                    }
                }
            })
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
                    .expect(testProp(['user'], keysEqual2, 'User object in Course is invalid'))
                    .expect(hasProps(['user'], ['_id', 'fullName'], '_id or fullName prop not found in User Document'))
                    .expect(testProp(['reviews', 0, 'user'], keysEqual2, 'User object in Course.reviews is invalid'))
                    .expect(hasProps(['reviews', 0, 'user'], ['_id', 'fullName'], '_id or fullName prop not found in User Docuemnt of Course.reviews'))
                    .expect(200)
                    .end(result(done));
            });
            
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
