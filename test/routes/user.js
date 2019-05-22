const supertest = require('supertest');

const app = require('../../src/index');
const {User} = require('../../src/models/');
const {propEq, onlyHasProps} = require('../../src/modules/assertions');

const result = done => (err, res) => {
    if (err) return done(err);
    return done();
};

const user = {
    fullName: 'Michael Braga',
    emailAddress: 'test@outlook.com',
    password: 'abc123'
};

app.set('env', 'test');

let server;

describe('POST /api/users', function() {
    before(function(done) {
        server = app.listen(app.get('port'), done);
    });


    it("returns a successful 201 response and Location header at '/'", function (done){
        supertest(app)
            .post('/api/users')
            .send(user)
            .set('Accept', 'application/json')
            .expect('Location', '/')
            .expect(201)
            .end(result(done));
    });

    it("returns a 422 response if the same emailAddress property is found.", function(done) {
        supertest(app)
            .post('/api/users')
            .send(user)
            .set('Accept', 'application/json')
            .expect(422, {
                message: 'Email is already registered.',
                errors: {}
            })
            .end(result(done))
    });

    it('returns a 422 response if the required fields are not found.', function(done) {
        supertest(app)
            .post('/api/users')
            .send({})
            .expect(propEq('message', 'User validation failed'))
            .expect(onlyHasProps(['errors'], ['emailAddress', 'fullName', 'password']))
            .expect(422)
            .end(result(done));
    })

    it('returns a 422 response if the email validation fails.', function(done) {
        supertest(app)
            .post('/api/users')
            .send({
                fullName: 'Michael', 
                emailAddress: 'fake123',
                password: '123abc'
            })
            .expect(propEq('message', 'User validation failed'))
            .expect(onlyHasProps(['errors'], ['emailAddress']))
            .end(result(done));
    });
});

describe('GET /api/user', function() {

    it('return a 200 response with the proper User object', function(done) {
        supertest(app)
            .get('/api/users')
            .auth(user.emailAddress, user.password)
            .expect(res => res.body._id = 0)
            .expect(200, {
                _id: 0,
                fullName: user.fullName,
                emailAddress: user.emailAddress
            })
            .end(result(done));
    });

    it('returns a 401 if no Authorization header is found', function(done) {
        supertest(app)
            .get('/api/users')
            .expect(401, {
                message: 'Failed to authenticate.',
                errors: {}
            })
            .end(result(done));
    });

    it('returns a 404 if no email is matched in the database', function(done) {
        supertest(app)
            .get('/api/users')
            .auth('123fake@fake_email.com', '123abc')
            .expect(404, {
                message: 'No user was found.',
                errors: {}
            })
            .end(result(done));
    });

    it('returns a 401 if passwords do not match', function(done) {
        supertest(app)
            .get('/api/users')
            .auth(user.emailAddress, 'thiswasfail')
            .expect(401, {
                message: 'Failed to authenticate.',
                errors: {}
            })
            .end(result(done));
    });

    after(function() {
        return User.deleteOne({emailAddress: user.emailAddress})
            .then(() => server.close())
            .catch(console.error);
    })
});
