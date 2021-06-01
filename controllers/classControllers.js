const { Class, Lecture, User } = require("../models");
const { Op } = require("sequelize");

class ClassControllers {
  static async getAll(req, res, next) {
    try {
      const classes = await Class.findAll({
        include: [Lecture, User],
      });
      res.status(200).json(classes);
    } catch (err) {
      next(err);
    }
  }
  static async getById(req, res, next) {
    const id = +req.params.id;
    try {
      const foundClass = await Class.findOne({
        where: { id },
        include: [Lecture, User],
      });
      if (foundClass) {
        res.status(200).json(foundClass);
      } else {
        next({ name: "error_getById", message: "Kelas tidak ditemukan" });
      }
    } catch (err) {
      next(err);
    }
  }
  static async getByLectureId(req, res, next) {
    const id = +req.params.id;
    try {
      const foundClass = await Class.findAll({
        where: { LectureId: id },
        include: [Lecture, User],
      });
      if (foundClass[0]) {
        res.status(200).json(foundClass);
      } else {
        next({ name: "error_getById", message: "Kelas tidak ditemukan" });
      }
    } catch (err) {
      next(err);
    }
  }
  static async getByUserId(req, res, next) {
    const id = +req.params.id;
    try {
      const foundClass = await Class.findAll({
        where: { UserId: id },
        include: [Lecture, User],
      });
      if (foundClass[0]) {
        res.status(200).json(foundClass);
      } else {
        next({ name: "error_getById", message: "Kelas tidak ditemukan" });
      }
    } catch (err) {
      next(err);
    }
  }
  static async addClass(req, res, next) {
    const { LectureId } = req.body;
    const UserId = req.loggedUser.id;
    try {
      const pickedLectured = await Lecture.findByPk(LectureId);
      const listClass = await Class.findAll({
        where: {
          UserId: UserId,
        },
      });
      if (listClass.length < pickedLectured.quota) {
        const newClass = await Class.create({
          UserId: UserId,
          LectureId: LectureId,
        });
        res
          .status(201)
          .json({ message: "Kuliah telah dibuat", id: newClass.id });
      } else {
        next({
          name: "error_quota",
          message: "batas kuota kelas telah mencapai maksimum",
        });
      }
    } catch (err) {
      next(err);
    }
  }
  static async rmClass(req, res, next) {
    const id = +req.params.id;
    const UserId = req.loggedUser.id;
    try {
      const foundClass = await Class.findByPk(id);
      if (foundClass) {
        if (foundClass.UserId === UserId) {
          await Class.destroy({
            where: {
              id: id,
            },
          });
          res.status(200).json({ message: "Kelas telah dihapus" });
        } else {
          next({ name: "error_authUserDelete", message: "Unauthorized" });
        }
      } else {
        next({ name: "error_rmClass", message: "Kelas tidak ditemukan" });
      }
    } catch (err) {
      next(err);
    }
  }

  static addClasses(req, res, next) {
    let { LectureId } = req.body;
    const UserId = req.loggedUser.id;
    let data;

    LectureId.forEach((e) => {
      data = {
        LectureId: e,
        UserId,
      };
      ClassControllers.filterClasses(data);
    });
    res.status(201).json({ message: `Berhasil bergabung dengan Kelas` });
  }

  static filterClasses(data) {
    let lectureName;
    let quota;
    let { LectureId } = data;
    Lecture.findByPk(LectureId).then((lectureData) => {
      quota = lectureData.quota;
      lectureName = lectureData.name;
      return Class.findAll({
        where: {
          LectureId: LectureId,
        },
      })
        .then((listClass) => {
          console.log(listClass.length, quota);
          if (listClass.length <= quota) {
            return Class.create(data).then((response) => {
              console.log("berhasil add gan");
              return "sukses add";
            });
          } else {
            console.log("gagal add gan");
            return "gagal nyet";
          }
        })
        .catch((err) => {
          return err;
        });
    });
  }

  static filterKrs(req, res, next) {
    const UserId = req.loggedUser.id;
    Class.findAll({
      where: {
        UserId,
      },
    })
      .then((data) => {
        const newData = [];
        data.forEach((e) => {
          newData.push(e.LectureId);
        });
        return Lecture.findAll({
          where: {
            id: {
              [Op.notIn]: newData,
            },
          },
        });
      })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = ClassControllers;
