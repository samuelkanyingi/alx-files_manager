const { expect } = require('chai');
const redisClient = require('../utils/redis');

describe('redisClient', () => {
    it('should connect to Redis', (done) => {
        redisClient.isAlive()
            .then((alive) => {
                expect(alive).to.be.true;
                done();
            })
            .catch((err) => done(err));
    });

    it('should set and get a value', (done) => {
        const key = 'testKey';
        const value = 'testValue';

        redisClient.set(key, value, 10)
            .then(() => redisClient.get(key))
            .then((result) => {
                expect(result).to.equal(value);
                done();
            })
            .catch((err) => done(err));
    });

    it('should expire a key', (done) => {
        const key = 'testKey';

        redisClient.set(key, 'testValue', 1)
            .then(() => {
                setTimeout(() => {
                    redisClient.get(key)
                        .then((result) => {
                            expect(result).to.be.null;
                            done();
                        })
                        .catch((err) => done(err));
                }, 1100);
            })
            .catch((err) => done(err));
    });
});

