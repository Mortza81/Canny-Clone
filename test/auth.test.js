const request = require("supertest");
const Email = require("../utils/email");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt=require('jsonwebtoken')
const sinon = require("sinon");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const { default: mongoose } = require("mongoose");

jest.setTimeout(40000);
describe("authentication test", () => {
  let server;
  let email;
  afterEach(async () => {
    if (email) {
      await email.restore();
    }
  });
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGODB_VERSION,
        systemBinary: process.env.MONGODB_PATH,
      },
    });
    server = app.listen(7000);
    await mongoose.connect(mongoServer.getUri());
  });
  afterAll(async () => {
    server.close();
    mongoose.disconnect();
  });
  describe("signup tests", () => {
    it("should send an email if data is ok", async () => {
      email = sinon.stub(Email.prototype, "send");
      const data = {
        name: "test",
        password: "test1234",
        passwordConfirm: "test1234",
        email: "example@example.com",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(200);
      expect(email.calledOnce).toBe(true);
      expect(res.body.message).toBe("verify token sent to your email");
    });
    it("should throw an error if user insert role", async () => {
      const data = {
        name: "test",
        password: "test1234",
        passwordConfirm: "test1234",
        email: "test1@example.com",
        role: "admin",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(400);
      expect(res.body.message).toBe("Not allowed field: role");
    });
    it("should throw an error if name is more then 20 chars", async () => {
      const data = {
        name: "testgjhvhjbvhbhibhbjknbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbuibuinm",
        password: "test1234",
        passwordConfirm: "test1234",
        email: "test1@example.com",
        role: "admin",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(400);
      expect(res.body.message).toBe(
        "Name must have less or equal then 20 characters",
      );
    });
    it("should throw an error if data does not have required fields", async () => {
      const data = {
        passwordConfirm: "test1234",
        email: "test1@example.com",
        role: "admin",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(400);
      expect(res.body.message).toBe("Name is requied");
    });
    it("should verify user if verify token is valid", async () => {
      email = sinon.stub(Email.prototype, "send");
      const data = {
        name: "ali",
        password: "test1234",
        passwordConfirm: "test1234",
        email: "ali@example.com",
      };
      await request(app).post("/api/v1/users/signup").send(data);
      const verifyToken = await email.firstCall.args[0].split("/").pop();
      const res = await request(app)
        .patch(`/api/v1/users/verify/${verifyToken}`)
        .expect(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.status).toBe("success");
    });
    it("should throw an error if verify token in invalid", async () => {
      const res = await request(app)
        .patch("/api/v1/users/verify/invalidtoken")
        .expect(400);
      expect(res.body.message).toBe("invalid or expired token");
    });
    it("should throw an error if email is invalid", async () => {
      const data = {
        name: "test",
        password: "test1234",
        passwordConfirm: "test1234",
        email: "exampleexample.com",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(400);
    });
    it("should throw an error if password and it's confirm are not the same", async () => {
      const data = {
        name: "test",
        password: "test12345",
        passwordConfirm: "test1234",
        email: "example@example.com",
      };
      const res = await request(app)
        .post("/api/v1/users/signup")
        .send(data)
        .expect(400);
    });
  });
  describe("login test", () => {
    it("should throw an error if email is invalid", async () => {
      const data = {
        password: "test1234",
        email: "exampleexample.com",
      };
      await request(app).post("/api/v1/users/login").send(data).expect(400);
    });
    it("should send jwt token if data is ok", async () => {
      await User.create({
        email: "hello@gmail.com",
        password: "test1234",
      });
      const data = {
        email: "hello@gmail.com",
        password: "test1234",
      };
      const res = await request(app)
        .post("/api/v1/users/login")
        .send(data)
        .expect(200);
      expect(res.body.status).toBe("success");
      expect(res.body.token).toBeDefined();
    });
  });
  describe("reset password test", () => {
    let user;
    beforeAll(async () => {
      user = await User.create({
        email: "test3@email.com",
        name: "test",
        verified: true,
      });
    });
    it("should send an email if email is valid", async () => {
      email = sinon.stub(Email.prototype, "send");
      const res = await request(app)
        .post("/api/v1/users/forgotPassword")
        .send({ email: "test3@email.com" });
      expect(email.calledOnce).toBe(true);
      expect(res.body.status).toBe("success");
    });
    it("should update the password if reset token is valid", async () => {
      email = sinon.stub(Email.prototype, "send");
      await request(app)
        .post("/api/v1/users/forgotPassword")
        .send({ email: "test3@email.com" });
      const resetToken = await email.firstCall.args[0].split("/").pop();
      const data = {
        password: "test12345",
        passwordConfirm: "test12345",
      };
      const res = await request(app)
        .patch(`/api/v1/users/resetPassword/${resetToken}`)
        .send(data)
        .expect(200);
      const user = await User.findById(res.body.data.user._id).select(
        "+password",
      );
      const userPassword = await bcrypt.compare("test12345", user.password);
      expect(res.body.status).toBe("success");
      expect(userPassword).toBe(true);
    });
  });
  describe("updateMe test", () => {
    let user;
    beforeAll(async () => {
      user = await User.create({
        name: "morteza",
        email: "morteza@example.com",
        password: "test1234",
        verified:true
      });
    });
    it("should throw an error if user wants to update password", async () => {
      data = {
        password: "test12345",
      };
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
      });
      const res = await request(app)
        .patch("/api/v1/users/updateMe")
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(400);
      expect(res.body.message).toBe("This route is not for changing password");
    });
    it("should update user data if data is valid", async () => {
      data = {
        name: "new name",
      };
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
      });
      const res = await request(app)
        .patch("/api/v1/users/updateMe")
        .set("Authorization", `Bearer ${token}`)
        .send(data)
        .expect(200);
      expect(res.body.status).toBe("success");
      expect(res.body.user.name).toBe("new name");
    });
  });
});
