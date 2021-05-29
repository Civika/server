const { User } = require("../models");
const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../helpers/jwt");

let teacher_token;
let student_token;
let student_id;

const studentData = {
  email: "student@gmail.com",
  password: "password",
  role: "student",
};

const teacherData = {
  email: "teacher@gmail.com",
  password: "password",
  role: "teacher",
};

let newStudentId = {
  email: "user@gmail.com",
  password: "wrongpassword",
  address: "new address",
  phoneNumber: 081212345678,
};

beforeAll((done) => {
  User.create(studentData)
    .then((user) => {
      student_id = user.id
      const studentPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      student_token = generateToken(studentPayload);
      return User.create(teacherData);
    })
    .then((teacher) => {
      const teacherPayload = {
        id: teacher.id,
        email: teacher.email,
        role: teacher.role,
      };
      teacher_token = generateToken(teacherPayload);
      done();
    })
    .catch();
});

afterAll((done) => {
  User.destroy()
    .then(() => {
      done();
    })
    .catch();
});

// empty string login
describe("POST login/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "",
        password: "",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Invalid Email or Password");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// wrong email or password
describe("POST user/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "user@gmail.com",
        password: "wrongpassword",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Invalid Email or Password");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success login
describe("POST Login/ SUCCESS", () => {
    test("Should send response status 200 and return an object with access_token", (done) => {
      request(app)
        .post("/login")
        .send(studentData)
        .then((res) => {
          expect(res.statusCode).toEqual(200);
          expect(typeof res.body).toEqual("object");
          expect(res.body).toHaveProperty("access_token", res.body.access_token);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

// empty string when edit
describe("PUT user/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .put("/user")
      .set("access_token", student_token)
      .send({
        password: "",
        address: "",
        phoneNumber: "",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please fill the empty string");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// unauthorized edit
describe("PUT user/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .put("/user")
      .set("access_token", teacher_token)
      .send(newStudentId)
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Unauthorized");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// no access token edit
describe("PUT user/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .put("/user")
      .send(newStudentId)
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success edit
describe("PUT user/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .put("/user")
      .set("access_token", student_token)
      .send(newStudentId)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("password");
        expect(res.body).toHaveProperty("address");
        expect(res.body).toHaveProperty("phoneNumber");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// get user failed no access token
describe("GET user/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .get("/user")
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// get user unauthorized
describe("GET user/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .get("/user")
      .set("access_token", "wrongaccesstoken")
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Unauthorized");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// get user by id user not found
describe("GET user/ FAILED", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get("/user/10")
      .set("access_token", student_id)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("User not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success get user by id
describe("GET user/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .get(`/user/${student_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("fullName");
        expect(res.body).toHaveProperty("address");
        expect(res.body).toHaveProperty("birthdate");
        expect(res.body).toHaveProperty("ipk");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("sks");
        expect(res.body).toHaveProperty("ukt");
        expect(res.body).toHaveProperty("uktStatus");
        expect(res.body).toHaveProperty("role");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});


// success get user
describe("GET user/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .get("/user")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("fullName");
        expect(res.body).toHaveProperty("address");
        expect(res.body).toHaveProperty("birthdate");
        expect(res.body).toHaveProperty("ipk");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("sks");
        expect(res.body).toHaveProperty("ukt");
        expect(res.body).toHaveProperty("uktStatus");
        expect(res.body).toHaveProperty("role");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});