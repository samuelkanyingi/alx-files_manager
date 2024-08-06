const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('dbClient', () => {
    it('should connect to MongoDB', (done) => {
        dbClient.isAlive()
            .then((alive) => {
                expect(alive).to.be.true;
                done();
            })
            .catch((err) => done(err));
    });

    it('should get the number of users', (done) => {
        dbClient.nbUsers()
            .then((nbUsers) => {
                expect(nbUsers).to.be.a('number');
                done();
            })
            .catch((err) => done(err));
    });

    it('should get the number of files', (done) => {
        dbClient.nbFiles()
            .then((nbFiles) => {
                expect(nbFiles).to.be.a('number');
                done();
            })
            .catch((err) => done(err));
    });
});

