const { User, sequelize } = require("../models");
const request = require("supertest");
const app = require("../app");
const { encrypt } = require("../helpers/jwt");

let teacher_token;
let student_token;
let student_id;
const pushToken = "ExponentPushToken[41nKMuDLIUF6evSO4_q3fP]";
const studentData = {
  fullName: "budi utomo",
  address: "jl. kelapa lilin no 15",
  birthdate: "1997-03-21",
  ipk: 3.25,
  password: "password123",
  email: "budi.utomo@hacktivmail.com",
  sks: 21,
  ukt: 13000000,
  uktStatus: false,
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

let newStudentId = {
  email: "user@gmail.com",
  password: "wrongpassword",
  address: "new address",
  phoneNumber: "081212345678",
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
      student_token = encrypt(studentPayload);
      return User.create(teacherData);
    })
    .then((teacher) => {
      teacher_id = teacher.id;
      const teacherPayload = {
        id: teacher.id,
        email: teacher.email,
        role: teacher.role,
      };
      teacher_token = encrypt(teacherPayload);
      done();
    })
    .catch();
});

afterAll((done) => {
  User.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  })
    .then(() => {
      sequelize.close();
      done();
    })
    .catch();
});

// empty string login
describe("POST login/ FAILED", () => {
  test("Should send response status 400", (done) => {
    const expected = [
      "kata sandi minimal memiliki 8 karakter",
      "kata sandi tidak boleh kosong",
      "harus berupa email",
      "email tidak boleh kosong",
    ];
    request(app)
      .post("/login")
      .send({
        email: "",
        password: "",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("email atau kata sandi salah");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// wrong email
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
        expect(res.body.message).toEqual("email atau kata sandi salah");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// wrong password
describe("POST user/ FAILED", () => {
  test("Should send response status 400", (done) => {
    request(app)
      .post("/login")
      .send({
        email: "budi.utomo@hacktivmail.com",
        password: "wrongpassword",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("email atau kata sandi salah");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// success login
describe("POST Login/ SUCCESS", () => {
  const dataLogin = {
    email: studentData.email,
    password: studentData.password,
    pushToken,
  };
  test("Should send response status 200 and return an object with access_token", (done) => {
    request(app)
      .post("/login")
      .send(dataLogin)
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
    let expected = [
      "kata sandi minimal memiliki 8 karakter",
      "kata sandi tidak boleh kosong",
      "alamat tidak boleh kosong",
      "nomor telephone tidak boleh kosong",
    ];
    request(app)
      .put(`/users/edit?id=${student_id}`)
      .set("access_token", student_token)
      .send({
        password: "",
        address: "",
        phoneNumber: "",
      })
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual([
          "Alamat tidak boleh kosong",
          "Nomor telepon tidak boleh kosong",
          "Kata sandi tidak boleh kosong",
        ]);
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
      .put(`/users/edit?id=${student_id}`)
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
      .put(`/users/edit?id=${student_id}`)
      .send(newStudentId)
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

// success edit
describe("PUT user/ SUCCESS", () => {
  test("Should send response status 200", (done) => {
    request(app)
      .put(`/users/edit?id=${student_id}`)
      .set("access_token", student_token)
      .send(newStudentId)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("data pengguna telah diupdate");
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
      .get("/users")
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

// get user by id user not found
describe("GET user/ FAILED", () => {
  test("Should send response status 404", (done) => {
    request(app)
      .get("/users/10")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body.message).toEqual("pengguna tidak ditemukan");
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
      .get(`/users/${student_id}`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("fullName");
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
      .get("/users")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body[0]).toHaveProperty("fullName");
        expect(res.body[0]).toHaveProperty("address");
        expect(res.body[0]).toHaveProperty("birthdate");
        expect(res.body[0]).toHaveProperty("ipk");
        expect(res.body[0]).toHaveProperty("email");
        expect(res.body[0]).toHaveProperty("sks");
        expect(res.body[0]).toHaveProperty("ukt");
        expect(res.body[0]).toHaveProperty("uktStatus");
        expect(res.body[0]).toHaveProperty("role");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

//payment duitku
describe("POST /users/:id/genDuitkuLink to duitku", () => {
  test("Should response 201", (done) => {
    const paymentData = {
      method: "B1",
    };
    request(app)
      .post(`/users/${student_id}/genDuitkuLink`)
      .set("access_token", student_token)
      .send(paymentData)
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("paymentUrl");
        expect(res.body).toHaveProperty("amount");
        expect(res.body).toHaveProperty("statusCode");
        expect(res.body).toHaveProperty("statusMessage");
        done();
      })
      .catch((err) => done(err));
  });
});

// success tuition payment
describe("PUT /users/:<user id>/payTuition", () => {
  test("Should response 200", (done) => {
    request(app)
      .put(`/users/${student_id}/payTuition`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message", "Ukt telah dibayar");
        done();
      })
      .catch((err) => done(err));
  });
});

// failed payment tuition because ukt status is already true
describe("PUT /users/:<user id>/payTuition", () => {
  test("Should response 400", (done) => {
    request(app)
      .put(`/users/${student_id}/payTuition`)
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("message", "Ukt sudah dibayar");
        done();
      })
      .catch((err) => done(err));
  });
});

// get all announcement
describe("GET /announcement", () => {
  test("Should response 200", (done) => {
    request(app)
      .get("/announcement")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});

let announcement_id;

//add new announcement
describe("GET /logout", () => {
  test("Should response 200", (done) => {
    request(app)
      .get("/logout")
      .set("access_token", student_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        done();
      })
      .catch((err) => done(err));
  });
});

describe("POST /announcement", () => {
  const message = {
    teacher: "Guru",
    title: "Send from jest",
    message: "Message from jest",
  };

  test("Should response 200", (done) => {
    request(app)
      .post("/announcement")
      .set("access_token", teacher_token)
      .send(message)
      .then((res) => {
        announcement_id = res.body.id;
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty(
          "message",
          "Pengumuman berhasil dikirim"
        );
        done();
      })
      .catch((error) => done(error));
  });
});

// delete announcement
describe("DELETE /announcement/:<announcement id>", () => {
  test("Should response 200", async (done) => {
    request(app)
      .delete(`/announcement/${announcement_id}`)
      .set("access_token", teacher_token)
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        done();
      })
      .catch((err) => done(err));
  });
});
