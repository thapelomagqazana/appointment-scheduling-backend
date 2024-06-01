const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const { MongoMemoryServer } = require("mongodb-memory-server");

describe("Database Connection", () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongoServer.getUri();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should connect to the database successfully', async () => {
        await connectDB();
        expect(mongoose.connection.readyState).toBe(1); // 1 means connected
    });

    it('should fail to connect to the database with an invalid URI', async () => {
        process.env.MONGO_URI = 'invalid_uri';
        const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
        await connectDB();
        expect(exit).toHaveBeenCalledWith(1);
        exit.mockRestore();
    });
});