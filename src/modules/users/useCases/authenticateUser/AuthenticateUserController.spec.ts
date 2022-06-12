import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import auth from "../../../../config/auth";

let connection: Connection;

describe("Authenticate a user", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user test",
      email: "user.test@test.com",
      password: "1554"
    });

    auth.jwt.secret = "1554";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.test@test.com",
      password: "1554"
    });

    expect(responseToken.status).toBe(200);
    expect(responseToken.body).toHaveProperty("token");
  })

  it("should not be able to authenticate a user nonexistent", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user.nonexistent@test.com",
      password: "1554"
    })

    expect(response.status).toBe(401);
  })

  it("should not be able to authenticate a user incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user test",
      email: "user.test@test.com",
      password: "1554"
    });

    auth.jwt.secret = "1554";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.test@test.com",
      password: "36856"
    });

    expect(responseToken.status).toBe(401);
  })

  it("should not be able to authenticate a user incorrect user name", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user test",
      email: "user.test@test.com",
      password: "1554"
    });

    auth.jwt.secret = "1554";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.test@testincorrect.com",
      password: "1554"
    });

    expect(responseToken.status).toBe(401);
  })

})
