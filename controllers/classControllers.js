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
                next({ name: "error_getById", message: "kelas tidak ditemukan" });
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
            if (foundClass) {
                res.status(200).json(foundClass);
            } else {
                next({ name: "error_getById", message: "kelas tidak ditemukan" });
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
                next({ name: "error_getById", message: "kelas tidak ditemukan" });
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
        // console.log(req.body, "<<<<<")
        let { LectureId } = req.body
        const UserId = req.loggedUser.id;
        let quota;
        // LectureId.map((e) => Number(e))
        let data = []

        if (LectureId.length === 1) {
            Lecture.findByPk(LectureId).then((lectureData) => {
                quota = lectureData.quota;
                return Class.findAll({
                    where: {
                        LectureId: LectureId,
                    },
                }).then((listClass) => {
                    // console.log(listClass.length, "<<<<<ini dataaa")
                    // console.log(quota, "<<<<<<<ini quotaaaaa")

                    if (listClass.length < quota) {
                        return Class.create({ UserId, LectureId }).then((response) => {
                            // console.log(response)
                            // console.log(UserId, "<<<<<<<<user")
                            // console.log(LectureId, "<<<<<<<lectureid")
                            res.status(201).json({ message: "Kuliah telah dibuat" });
                        });
                    } else {
                        next({
                            name: "error_quota",
                            message: "batas kuota kelas telah mencapai maksimum",
                        });
                    }
                });
            });
        } else {
            LectureId.forEach(e => {
                data.push({
                    LectureId: e,
                    UserId
                })
            });
            Class.bulkCreate(data)
                .then(result => {


                    let newData = []
                    result.forEach(e => {
                        newData.push(e.dataValues.id)
                    })

                    return Class.findAll({
                        where: {
                            id: {
                                [Op.in]: newData
                            }
                        },
                        include: [{
                            model: Lecture,
                            where: {
                                id: {
                                    [Op.in]: LectureId
                                }
                            }
                        }]
                    });
                })
                .then(data => {
                    res.status(200).json(data)
                })

            .catch(err => {
                console.log(err)
            })

        }

    }

    static filterKrs(req, res, next) {
        const UserId = req.loggedUser.id;

        Class.findAll({
                where: {
                    UserId
                }
            })
            .then(data => {
                // console.log(data, "<<<<<<<<<")
                const newData = []

                data.forEach(e => {
                    newData.push(e.LectureId)
                });
                // console.log(newData, "<<<<<<<<")
                return Lecture.findAll({
                    where: {
                        id: {
                            [Op.notIn]: newData
                        }
                    }
                });

            })

        .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                console.log(err)
            })
    }

}

module.exports = ClassControllers;