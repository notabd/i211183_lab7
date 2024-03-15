import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
const expect = chai.expect;
chai.use(chatHttp);

describe('User and Tasks Tests', () => {
    let token;

    // Test user registration
    it('should register a new user', (done) => {
        chai.request(app)
            .post('/api/register')
            .send({ username: 'testUser', password: 'password' })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message', 'User created');
                done();
            });
    });

    // Test user login
    it('should login the user', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ username: 'testUser', password: 'password' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                // Save the token for later tests
                token = res.body.token; 
                done();
            });
    });

    // Test task creation
    it('should create a new task', (done) => {
        chai.request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Task', description: 'Test Description', dueDate: '2024-03-20', category: 'Test', status: 'Pending', priority: 'High' })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('title', 'Test Task');
                done();
            });
    });

    // Test fetching tasks
    it('should fetch all tasks for the logged-in user', (done) => {
        chai.request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').that.is.not.empty;
                done();
            });
    });
});
