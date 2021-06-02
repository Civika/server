const { Class, Lecture, User, Sequelize } = require("../models");
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
    let quota;
    let data = [];

    if (LectureId.length === 1) {
      Lecture.findByPk(LectureId[0]).then((lectureData) => {
        quota = lectureData.quota;
        return Class.findAll({
          where: {
            LectureId: LectureId,
          },
        }).then((listClass) => {
          if (listClass.length < quota) {
            return Class.create({ UserId, LectureId }).then((response) => {
              res.status(201).json({ message: "Kuliah telah dibuat" });
            });
          } else {
            next({
              name: "error_quota",
              message: "Batas kuota kelas telah mencapai maksimum",
            });
          }
        });
      });
    } else {
      LectureId.forEach((e) => {
        data.push({
          LectureId: e,
          UserId,
        });
      });
      let LecturesQuota = [];
      let fullClass = [];
      Lecture.findAll({ where: { id: { [Op.or]: LectureId } } })
        .then((dataLectures) => {
          LecturesQuota = dataLectures;
          return Class.findAll({
            where: { LectureId: { [Op.in]: LectureId } },
            group: ["LectureId"],
            attributes: [
              "LectureId",
              [Sequelize.fn("COUNT", "LectureId"), "count"],
            ],
            raw: true,
          });
        })
        .then(async (dataClassesCounted) => {
          if (dataClassesCounted.length >= 1) {
            LecturesQuota.forEach(async (quota) => {
              dataClassesCounted.forEach(async (countedClass) => {
                if (quota.id === countedClass.LectureId) {
                  if (quota.quota > countedClass.count) {
                    await Class.create({ UserId, LectureId: quota.id });
                  } else {
                    fullClass.push(quota.name);
                  }
                }
              });
            });
            if (fullClass.length >= 1 && fullClass.length < LectureId.length) {
              res.status(201).json({
                message:
                  "Kelas berhasil ditambahkan, namun ada kelas yang penuh yaitu ",
                fullClass,
              });
            } else if (fullClass.length < LectureId.length) {
              res.status(201).json({ message: "Kelas berhasil ditambahkan" });
            } else {
              res
                .status(400)
                .json({ message: "Seluruh kelas yang anda pilih sudah penuh" });
            }
          } else {
            await Class.bulkCreate(data);
            res.status(201).json({ message: "Kelas berhasil ditambahkan" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
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
