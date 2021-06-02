const { User, Lecture, sequelize } = require("../models");
const request = require("supertest");
const app = require("../app");
const { encrypt } = require("../helpers/jwt");

let teacher_token;
let student_token;
let student_id;
let lecture_id;
let arrayOfLectureId = [];
let lectureIdOneArray = [];
let class_id;

const studentData = {
  fullName: "budi utomo",
  address: "jl. kelapa lilin no 15",
  birthdate: "1997-03-21",
  ipk: 3.25,
  password: "password123",
  email: "budi.utomo@hacktivmail.com",
  sks: 21,
  ukt: 13000000,
  uktStatus: true,
  phoneNumber: "+62 834-3541-63367",
  role: "student",
};

const teacherData = {
  fullName: "Andi Javier",
  address: "Jl Mulyosari Prima I 3 Bl MA/4",
  birthdate: "1998-05-23",
  ipk: 3.62,
  password: "password678",
  email: "andi.utomo@hacktivmail.com",
  sks: 21,
  ukt: 13000000,
  uktStatus: true,
  phoneNumber: "+62 891-5381-0446",
  role: "teacher",
};

const lectureData = [
  {
    name: "English Lesson",
    quota: 1,
    credits: 3,
    schedule: "16.30",
  },
  {
    name: "Agama",
    quota: 1,
    credits: 3,
    schedule: "16.30",
  },
  {
    name: "Bahasa",
    quota: 2,
    credits: 3,
    schedule: "16.30",
  },
  {
    name: "Penjas",
    quota: 1,
    credits: 3,
    schedule: "16.30",
  },
];

beforeAll((done) => {
  User.create(studentData)
    .then((user) => {
      student_id = user.id;
      const studentPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      student_token = encrypt(studentPayload);
      return User.create(teacherData);
    })
    .then((teacher) => {
      const teacherPayload = {
        id: teacher.id,
        email: teacher.email,
        role: teacher.role,
      };
      teacher_token = encrypt(teacherPayload);
      return Lecture.bulkCreate(lectureData);
    })
    .then((lectures) => {
      lectures.forEach((lecture, idx) => {
        if (idx === 0) {
          lecture_id = lecture.dataValues.id;
        } else if (idx === 1) {
          // arrayOfLectureId.push(lecture.dataValues.id);
          lectureIdOneArray.push(lecture.dataValues.id);
        } else {
          arrayOfLectureId.push(lecture.dataValues.id);
        }
      });
      done();
    })
    .catch();
});

afterAll((done) => {
  User.destroy({ truncate: true, restartIdentity: true, cascade: true })
    .then(() => {
      return Lecture.destroy({
        truncate: true,
        restartIdentity: true,
        cascade: true,
      }).then(() => {
        sequelize.close();
        done();
      });
    })
    .catch();
});

// failed join class no access token
describe("POST class/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .post("/class")
      .send({
        lectureId: lecture_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Harap Masuk Terlebih Dahulu");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success join class
describe("POST class/ SUCCESS", () => {
  test("Should send response status 201", (done) => {
    request(app)
      .post("/class")
      .set("access_token", student_token)
      .send({
        LectureId: lecture_id,
      })
      .then((res) => {
        class_id = res.body.id;
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Kuliah telah dibuat");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed join class exceed quota limit
describe("POST class/ SUCCESS", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/class")
      .set("access_token", student_token)
      .send({
        LectureId: lecture_id,
        UserId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual(
          "batas kuota kelas telah mencapai maksimum"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed to get class no access token
describe("GET class/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .get("/class")
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Harap Masuk Terlebih Dahulu");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// get all class
describe("GET class/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .get("/class")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body[0]).toHaveProperty("Lecture");
        expect(res.body[0]).toHaveProperty("User");
        expect(res.body[0]).toHaveProperty("LectureId");
        expect(res.body[0]).toHaveProperty("UserId");
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
        expect(res.body.message).toEqual("Kelas tidak ditemukan");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//succes get class by Lecture id
describe("GET /class/lecture/:<Lecture id>", () => {
  test("Should send status 200", (done) => {
    request(app)
      .get(`/class/lecture/${lecture_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("UserId");
        expect(res.body[0]).toHaveProperty("LectureId");
        expect(res.body[0]).toHaveProperty("Lecture");
        expect(res.body[0]).toHaveProperty("User");

        done();
      })
      .catch((err) => done(err));
  });
});

//failed get class by lecture id
describe("GET /class/lecture/:<lecture id> FAILED", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get(`/class/lecture/100`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message", "Kelas tidak ditemukan");

        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//succes get class by user id
describe("GET /class/user/:<user id>", () => {
  test("Should send status 200", (done) => {
    request(app)
      .get(`/class/user/${student_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("UserId");
        expect(res.body[0]).toHaveProperty("LectureId");
        expect(res.body[0]).toHaveProperty("Lecture");
        expect(res.body[0]).toHaveProperty("User");

        done();
      })
      .catch((err) => done(err));
  });
});

//failed get class by user id
describe("GET /class/lecture/:<user id> FAILED", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get(`/class/user/10`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message", "Kelas tidak ditemukan");

        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success get class by id
describe("GET class/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .get(`/class/${class_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("UserId");
        expect(res.body).toHaveProperty("LectureId");
        expect(res.body).toHaveProperty("Lecture");

        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//failed delete class no access token
describe("DELETE class/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .delete(`/class/${class_id}`)
      .then((res) => {
        expect(res.statusCode).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Harap Masuk Terlebih Dahulu");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//failed delete class unauthorized
describe("DELETE class/ FAILED", () => {
  test("Should send response status 401", (done) => {
    request(app)
      .delete(`/class/${class_id}`)
      .set("access_token", teacher_token)
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

// success delete class
describe("DELETE class/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .delete(`/class/${class_id}`)
      .set("access_token", student_token)
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Kelas telah dihapus");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// failed delete class not found
describe("DELETE class/ FAILED", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .delete(`/class/${class_id}`)
      .set("access_token", student_token)
      .send({
        lectureId: lecture_id,
        userId: student_id,
      })
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("Kelas tidak ditemukan");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// add 1 class
describe("POST /classes", () => {
  test("Should response 201", (done) => {
    request(app)
      .post("/classes")
      .set("access_token", student_token)
      .send({ LectureId: lectureIdOneArray })
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message", "Kuliah telah dibuat");
        done();
      })
      .catch((err) => done(err));
  });
});

// class full
describe("POST /classes FAILED", () => {
  test("Should response 400", (done) => {
    request(app)
      .post("/classes")
      .set("access_token", student_token)
      .send({ LectureId: lectureIdOneArray })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty(
          "message",
          "Batas kuota kelas telah mencapai maksimum"
        );
        done();
      })
      .catch((err) => done(err));
  });
});

// add more than 1 classes
describe("POST /classes SUCESS", () => {
  test("Should response 201", (done) => {
    request(app)
      .post("/classes")
      .set("access_token", student_token)
      .send({ LectureId: arrayOfLectureId })
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty(
          "message",
          "Kelas berhasil ditambahkan"
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe("POST /classes sucess but not all classes", () => {
  test("Should response 201", (done) => {
    request(app)
      .post("/classes")
      .set("access_token", student_token)
      .send({ LectureId: arrayOfLectureId })
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty(
          "message",
          "Kelas berhasil ditambahkan, namun ada kelas yang penuh yaitu "
        );
        done();
      });
  });
});

describe("POST /classes fail because all classes is full", () => {
  test("Should response 400", (done) => {
    request(app)
      .post("/classes")
      .set("access_token", student_token)
      .send({ LectureId: arrayOfLectureId })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty(
          "message",
          "Seluruh kelas yang anda pilih sudah penuh"
        );
        done();
      });
  });
});

//filter class
describe("/GET Class for KRS", () => {
  test("Should response 200", (done) => {
    request(app)
      .get("/krs")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("name");
        expect(res.body[0]).toHaveProperty("quota");
        expect(res.body[0]).toHaveProperty("credits");
        expect(res.body[0]).toHaveProperty("schedule");
        done();
      })
      .catch((err) => done(err));
  });
});
