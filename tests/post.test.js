import "regenerator-runtime";
import request from "supertest";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import server from "../app.js";
import { User } from "../models/User.js";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

describe("포스트 테스트", () => {
  let token = "Bearer ";
  const email = "example@email.com";
  const password = bcrypt.hashSync("password", 10);
  const name = "young";
  const secretKey = process.env.JWT_SECRET;
  let postId;

  beforeAll(async () => {
    const userId = await User.createUser(email, password, name);
    token += sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        data: userId,
      },
      secretKey
    );
  });

  it("포스트 생성 테스트", async () => {
    const res = await request(server)
      .post("/api/posts")
      .set("authorization", token)
      .send({
        title: "title",
        contents: "contents",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.isOk).toEqual(true);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["isOk", "postId"])
    );
    postId = res.body.postId;
  });

  it("생성된 포스트 get", async () => {
    const res = await request(server)
      .get("/api/posts/" + postId)
      .send();

    expect(res.statusCode).toEqual(201);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["title", "contents", "author"])
    );
    expect(res.body.title).toEqual("title");
    expect(res.body.author).toEqual("young");
  });

  it("포스트 수정하기", async () => {
    const res = await request(server)
      .put("/api/posts/" + postId)
      .send({ title: "updatedTitle", contents: "updatedContents" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual("updatedTitle");
    expect(res.body.contents).toEqual("updatedContents");
  });

  it("없는 포스트 수정하기", async () => {
    const res = await request(server)
      .put("/api/posts/" + "notexistspost")
      .send({ title: "updatedTitle", contents: "updatedContents" });

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("존재하지 않는 글입니다.");
  });

  it("없는 포스트 찾기", async () => {
    const res = await request(server)
      .get("/api/posts/" + "notexistspost")
      .send();

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.msg).toEqual("존재하지 않는 글입니다.");
  });

  it("포스트 삭제하기", async () => {
    const res = await request(server)
      .delete("/api/posts/" + postId)
      .send();

    expect(res.statusCode).toEqual(204);
    expect(res.body.isOk).toEqual(true);
  });

  it("없는 포스트 삭제하기", async () => {
    const res = await request(server)
      .delete("/api/posts/" + "notexistpost")
      .send();

    expect(res.statusCode).toEqual(403);
    expect(res.body.isOk).toEqual(false);
    expect(res.body.isOk).toEqual("존재하지 않는 글입니다.");
  });

  it("포스트 리스트 호출", async () => {
    const res = await request(server).get("/api/posts").send();

    expect(res.statusCode).toEqual(200);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await User.deleteOne({
      email,
      password,
      name,
    });

    await mongoose
      .createConnection(process.env.MONGO_URI + "/boardTest")
      .collection("posts")
      .deleteMany({});
  });
});
