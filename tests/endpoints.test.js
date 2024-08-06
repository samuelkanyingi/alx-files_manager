const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Adjust this if the server is in a different file
const { expect } = chai;

chai.use(chaiHttp);

describe('Endpoints', () => {
    let authToken;

    before((done) => {
        chai.request(server)
            .get('/connect')
            .set('Authorization', 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=') // Adjust with your credentials
            .end((err, res) => {
                authToken = res.body.token;
                done();
            });
    });

    describe('GET /status', () => {
        it('should return the status', (done) => {
            chai.request(server)
                .get('/status')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('redis');
                    expect(res.body).to.have.property('db');
                    done();
                });
        });
    });

    describe('GET /stats', () => {
        it('should return the stats', (done) => {
            chai.request(server)
                .get('/stats')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('users');
                    expect(res.body).to.have.property('files');
                    done();
                });
        });
    });

    describe('POST /users', () => {
        it('should create a new user', (done) => {
            chai.request(server)
                .post('/users')
                .send({ email: 'testuser@example.com', password: 'password123' })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('email', 'testuser@example.com');
                    done();
                });
        });
    });
    
    describe('GET /connect', () => {
        it('should connect and return a token', (done) => {
            chai.request(server)
                .get('/connect')
                .set('Authorization', 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=') // Adjust with your credentials
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    done();
                });
        });
    });

    describe('GET /disconnect', () => {
        it('should disconnect the user', (done) => {
            chai.request(server)
                .get('/disconnect')
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(204);
                    done();
                });
        });
    });

    describe('GET /users/me', () => {
        it('should get the authenticated user info', (done) => {
            chai.request(server)
                .get('/users/me')
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('email');
                    userId = res.body.id;
                    done();
                });
        });
    });

    describe('POST /files', () => {
        it('should create a new file', (done) => {
            chai.request(server)
                .post('/files')
                .set('X-Token', authToken)
                .send({
                    name: 'testfile.txt',
                    type: 'file',
                    data: 'SGVsbG8gV29ybGQh',
                    parentId: 0,
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('id');
                    fileId = res.body.id;
                    done();
                });
        });
    });

    describe('GET /files/:id', () => {
        it('should get a file by ID', (done) => {
            chai.request(server)
                .get(`/files/${fileId}`)
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('id', fileId);
                    done();
                });
        });
    });

    describe('GET /files', () => {
        it('should get files with pagination', (done) => {
            chai.request(server)
                .get('/files')
                .set('X-Token', authToken)
                .query({ page: 0, limit: 2 })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    describe('PUT /files/:id/publish', () => {
        it('should publish a file', (done) => {
            chai.request(server)
                .put(`/files/${fileId}/publish`)
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('isPublic', true);
                    done();
                });
        });
    });

    describe('PUT /files/:id/unpublish', () => {
        it('should unpublish a file', (done) => {
            chai.request(server)
                .put(`/files/${fileId}/unpublish`)
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('isPublic', false);
                    done();
                });
        });
    });

    describe('GET /files/:id/data', () => {
        it('should get file data', (done) => {
            chai.request(server)
                .get(`/files/${fileId}/data`)
                .set('X-Token', authToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.equal('Hello World!');
                    done();
                });
        });

        it('should get file data with size parameter', (done) => {
            chai.request(server)
                .get(`/files/${fileId}/data`)
                .set('X-Token', authToken)
                .query({ size: 100 })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    // Assuming the file data is different for size 100
                    done();
                });
        });
    });
});

