const supertest = require('supertest');
const app = require('../../src/index');
const R = require('ramda');

const result = done => (err, res) => {
    if (err) return done(err);
    return done();
};

describe('POST /api/users', function() {
    const user = {
        fullName: 'Michael Braga',
        emailAddress: 'test@outlook.com',
        password: 'abc123'
    };

    it("returns a successful 201 response and Location header at '/'", function (done){
        supertest(app)
            .post('/api/users')
            .send(user)
            .set('Accept', 'application/json')
            .expect(201)
            .expect('Location', '/')
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
            .expect(422, {
                message: 'User validation failed',
                errors: {
                    emailAddress: 'Email is required.',
                    fullName: 'Full name is required.',
                    password: 'Password is required.'
                }
            })
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
            .expect(422, {
                message: 'User validation failed',
                errors: {
                    emailAddress: 'fake123 is not a valid email.'
                }
            })
            .end(result(done));
    });
});
