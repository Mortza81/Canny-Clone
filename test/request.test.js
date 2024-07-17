const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const app = require("../app");
const User = require("../models/userModel");
const Request = require("../models/requestModel");
const Interaction = require("../models/interactionModel");

jest.mock("sharp", () =>
  jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(),
  }),
);
jest.setTimeout(30000);
describe("request tests", () => {
  let data = {
    title: "title",
    description: "description",
  };
  let server;
  let user1;
  let user2;
  let usertoken1;
  let usertoken2;
  let testReq;
  const creatToken = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    return token;
  };

  beforeAll(async () => {
    server = app.listen(8000);
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    user1 = await User.create({
      name: "morteza",
      email: "morteza@example.com",
      password: "test1234",
      verified: true,
    });
    user2 = await User.create({
      name: "ali",
      email: "ali@example.com",
      password: "test1234",
      verified: true,
    });
    testReq = await Request.create({
      title: "req for user1",
      description: "test",
      user: user1._id,
    });
    usertoken1 = creatToken(user1._id);
    usertoken2 = creatToken(user2._id);
  });
  afterAll(async () => {
    server.close();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  it("should throw an error if an not logged in user wants to make a req", async () => {
    data = {
      title: "title",
      description: "description",
    };
    const res = await request(app)
      .post("/api/v1/requests")
      .send(data)
      .expect(401);
    expect(res.body.message).toBe(
      "You are not logged in! Please log in to get access.",
    );
  });
  it("should create a req if data is valid and user is logged in", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .field("title", data.title)
      .field("description", data.description)
      .set("Authorization", `Bearer ${usertoken1}`)
      .attach("images", path.join(__dirname, "files/tour-1-1.jpg"));
    expect(res.body.status).toBe("success");
    expect(res.body.data.images[0]).toBeDefined();
    expect(sharp().resize).toBeCalledWith(2000, 1333);
    expect(sharp().toFormat).toBeCalledWith("jpeg");
    expect(sharp().toFile).toBeCalledWith(
      `public/img/requests/${res.body.data.images[0]}`,
    );
  });
  it("should throw an error if image filed has not a valid type", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .field("title", data.title)
      .field("description", data.description)
      .set("Authorization", `Bearer ${usertoken2}`)
      .attach("images", path.join(__dirname, "/files/test"));

    expect(res.body.message).toBe("Not an image! Please upload only images.");
  });
  it("should throw an error if user wants to upload more than to images", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .field("title", data.title)
      .field("description", data.description)
      .set("Authorization", `Bearer ${usertoken1}`)
      .attach("images", path.join(__dirname, "files/test"))
      .expect(400);
    expect(res.body.message).toBe("Not an image! Please upload only images.");
  });
  it("should throw an error if user wants to upload more than to images", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .field("title", data.title)
      .field("description", data.description)
      .set("Authorization", `Bearer ${usertoken1}`)
      .attach("images", path.join(__dirname, "files/tour-1-1.jpg"))
      .attach("images", path.join(__dirname, "files/tour-1-2.jpg"))
      .attach("images", path.join(__dirname, "files/tour-1-3.jpg"))
      .expect(400);
    expect(res.body.message).toBe(
      "Maximum number of images exceeded. Only up to 2 images are allowed.",
    );
  });
  it("should throw an error if user wants to update other user request", async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${testReq.id}`)
      .set("Authorization", `Bearer ${usertoken2}`);
    expect(res.body.message).toBe(
      "Data not found or you do not have the necessary permissions",
    );
  });
  it("should update req if everything is okay", async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${testReq.id}`)
      .set("Authorization", `Bearer ${usertoken1}`)
      .send({ title: "new title" })
      .expect(200);
    expect(res.body.data.title).toBe("new title");
  });
  it("user should be able to vote for a request", async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${testReq._id}/vote`)
      .set("Authorization", `Bearer ${usertoken1}`)
      .expect(201);
    expect(res.body.status).toBe("success");
  });
  it("user should be able to delete it's vote", async () => {
    const vote = await Interaction.create({
      user: user2._id,
      target_type: "Request",
      target: testReq._id,
    });
    const res = await request(app)
      .delete(`/api/v1/requests/${testReq._id}/vote`)
      .set("Authorization", `Bearer ${usertoken2}`)
      .expect(200);
    expect(await Interaction.findById(vote.id)).toBeNull();
    expect(res.body.status).toBe("success");
  });
  it("should throw an error if user wants to vote a req multipletime", async () => {
    const vote = await Interaction.create({
      user: user2._id,
      target_type: "Request",
      target: testReq._id,
    });
    const res = await request(app)
      .post(`/api/v1/requests/${testReq._id}/vote`)
      .set("Authorization", `Bearer ${usertoken2}`)
      .expect(400);
    expect(res.body.message).toBe("Duplicated field, Please use another value");
  });
});
