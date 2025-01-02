import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user.model";
import testUsers from "./test_users.json";

var app: Express;
let userId: string = "";

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();

    //await User.insertMany(testUsers);  //Run only if it does not exist in the DB
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();
    done();
});

describe("User Tests", () => {
    test("User test get all", async () => {
        const response = await request(app).get("/users");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testUsers.length);
    });

    test("Test Create User", async () => {
        const newUser = { username: "unique_user", email: "unique_user@example.com", password: "secure_password" };
        const response = await request(app).post("/users").send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.username).toBe(newUser.username);
        expect(response.body.email).toBe(newUser.email);
        userId = response.body._id;
    });

    test("User get user by id", async () => {
        const response = await request(app).get(`/users/${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("unique_user");
    });

    test("Test Update User", async () => {
        const updatedUser = { username: "updated_user", email: "updated_user@example.com" };
        const response = await request(app).put(`/users/${userId}`).send(updatedUser);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(updatedUser.username);
        expect(response.body.email).toBe(updatedUser.email);
    });

    test("Test Delete User", async () => {
        const response = await request(app).delete(`/users/${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Item deleted successfully");
    });

    test("Test password comparison", async () => {
        const user = await User.findOne({ username: testUsers[0].username });
        expect(user).not.toBeNull();
        if (user) {
            const isMatch = await user.comparePassword(testUsers[0].password);
            expect(isMatch).toBe(true);
        }
    });
});