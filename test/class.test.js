const { User, Lecture } = require("../models");
const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../helpers/jwt");

let teacher_token;
let student_token;
let student_id;
let lecture_id;

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

const lectureData = {
  name: "Lecture Test",
  quota: 30,
  credits: 3,
  schedule: "Kamis",
};

beforeAll((done) => {
  User.create(studentData)
    .then((user) => {
      student_id = user.id;
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
      return Lecture.create(lectureData);
    })
    .then((lecture) => {
      lecture_id = lecture.id;
      done();
    })
    .catch();
});

afterAll((done) => {
  User.destroy()
    .then(() => {
      return Lecture.destroy().then(() => {
        done();
      });
    })
    .catch();
});

// failed join class no access token
describe("POST class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/class")
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed join class unauthorized
describe("POST class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/class")
      .set("access_token", "123456")
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success join class
describe("POST class/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .post("/class")
      .set("access_token", student_token)
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("lectureId");
        expect(res.body).toHaveProperty("studentId");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed to get class no access token
describe("GET class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .get("/class")
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed to get class unauthorized
describe("GET class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .get("/class")
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Unauthorized");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// get all class
describe("GET class/ SUCCESS", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .get("/class")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Success To Resign from Class");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed get class by id no class found
describe("GET class/ SUCCESS", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get("/class/10")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("No Class Found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success get class by id
describe("GET class/ SUCCESS", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get(`/class/${class_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toHaveProperty("studentId");
        expect(res.body.message).toHaveProperty("lectureId");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//failed delete class no access token
describe("DELETE class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .delete("/class")
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Please Login First");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//failed delete class unauthorized
describe("DELETE class/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .delete("/class")
      .set("access_token", teacher_token)
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Unauthorized");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success delete class
describe("DELETE class/ SUCCESS", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .delete("/class")
      .set("access_token", student_token)
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Success To Resign from Class");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
