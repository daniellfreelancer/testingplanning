const Membership = require('../models/membershipFutbol');
// const { S3Client, PutObjectCommand, PutObjectRetentionCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const crypto = require('crypto')
// const sharp = require('sharp'); // tampoco se usa aquí
const Institution = require('../models/institution');
const Club = require('../models/club');
const Player = require('../models/student');
const { uploadMulterFile } = require('../utils/s3Client'); // helper centralizado S3

const membershipController = {
  async createMembershipNewMembers(req, res) {
    const { clubId, year, amount } = req.params;

    try {
      const club = await Club.findById(clubId).populate('students');

      if (!club) {
        return res.status(404).json({ message: 'Club no encontrado' });
      }

      const existingMemberships = await Membership.find({ club: clubId, year });
      const existingStudentIds = new Set(
        existingMemberships.map(membership => membership.student.toString())
      );

      const membershipsToCreate = [];

      for (const student of club.students) {
        if (!existingStudentIds.has(student._id.toString())) {
          const newMembership = new Membership({
            student: student._id,
            year: year,
            club: club._id,
            institution: club.institution,
            amount: amount,
            statusMembership: 'activo',
            january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
            december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
          });

          membershipsToCreate.push(newMembership.save());
        }
      }

      const savedMemberships = await Promise.all(membershipsToCreate);

      return res
        .status(201)
        .json({ message: 'Membresías creadas exitosamente', memberships: savedMemberships });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al crear las membresías', error });
    }
  },

  async updateStatus(req, res) {
    const { membershipId } = req.params;
    const { status, month, paymentType, paymentPrice } = req.body;

    try {
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      const validMonths = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
      ];

      if (!validMonths.includes(month)) {
        return res.status(400).json({ message: 'Mes no válido' });
      }

      membership[month].status = status;
      membership[month].paymentType = paymentType;
      membership[month].paymentPrice = paymentPrice;

      await membership.save();

      return res
        .status(200)
        .json({ message: 'Estado actualizado exitosamente', membership });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al actualizar el estado', error });
    }
  },

  async updatePayment(req, res) {
    const { studentId, year, month, status } = req.body;

    try {
      const membership = await Membership.findOne({ student: studentId, year });
      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      const validMonths = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
      ];

      if (!validMonths.includes(month)) {
        return res.status(400).json({ message: 'Mes no válido' });
      }

      // helper centralizado para subir el comprobante a S3
      if (req.file) {
        const key = await uploadMulterFile(
          req.file,
          `memberships/${membership._id}/${month}-recipe`
        );

        membership[month].recipe = key;
      }

      membership[month].paymentDate = new Date();
      membership[month].status = status;

      await membership.save();

      return res
        .status(200)
        .json({ message: 'Pago actualizado exitosamente', membership });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al actualizar el pago', error });
    }
  },

  async getMembershipByClub(req, res) {
    const { clubId } = req.params;

    try {
      const memberships = await Membership.find({ club: clubId })
        .populate('student', {
          name: 1,
          lastName: 1,
          email: 1,
          imgUrl: 1,
          phone: 1,
          school_representative: 1,
        })
        .sort({ 'student.lastName': 1 });

      if (!memberships.length) {
        return res
          .status(404)
          .json({ message: 'No se encontraron membresías para este club' });
      }

      return res.status(200).json({ memberships });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al obtener las membresías', error });
    }
  },

  async getMembershipByStudent(req, res) {
    const { studentId } = req.params;

    try {
      const memberships = await Membership.find({ student: studentId })
        .populate('club', { name: 1 })
        .sort({ year: 1 });

      if (!memberships.length) {
        return res.status(404).json({
          message: 'No se encontraron membresías para este estudiante',
        });
      }

      return res.status(200).json({ memberships });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al obtener las membresías', error });
    }
  },

  async deleteMembership(req, res) {
    const { membershipId } = req.params;

    try {
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      await Membership.findByIdAndDelete(membershipId);

      return res
        .status(200)
        .json({ message: 'Membresía eliminada exitosamente' });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al eliminar la membresía', error });
    }
  },

  async createMembershipByPlayer(req, res) {
    const { studentId, clubId } = req.params;

    try {
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({ message: 'Club no encontrado' });
      }

      const newMembership = new Membership({
        student: studentId,
        club: clubId,
        statusMembership: 'activo',
        amount: 0,
        institution: club.institution,
        year: new Date().getFullYear(),
        january: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        february: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        march: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        april: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        may: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        june: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        july: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        august: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        september: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        october: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        november: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
        december: { status: 'pendiente', recipe: '', paymentType: '', paymentDate: null, paymentPrice: null },
      });

      await newMembership.save();

      return res
        .status(201)
        .json({ message: 'Membresía creada exitosamente', membership: newMembership });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al crear la membresía', error });
    }
  },

  async updateMemebership(req, res) {
    try {
      const { membershipId } = req.params;
      const updatedMembership = req.body;

      const membership = await Membership.findByIdAndUpdate(
        membershipId,
        updatedMembership,
        { new: true }
      );

      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      return res
        .status(200)
        .json({ message: 'Membresía actualizada exitosamente', membership });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al actualizar la membresía', error });
    }
  },

  async createMembership(req, res) {
    const { year, institutionId, amount } = req.params;

    try {
      const institution = await Institution.findById(institutionId).populate({
        path: 'clubs',
        populate: {
          path: 'students',
          model: 'student',
        },
      });

      if (!institution) {
        return res.status(404).json({ message: 'Institución no encontrada' });
      }

      const memberships = [];

      for (const club of institution.clubs) {
        if (Array.isArray(club.students)) {
          for (const student of club.students) {
            const existingMembership = await Membership.findOne({
              student: student._id,
              year: year,
              club: club._id,
              institution: institution._id,
              statusMembership: 'activo',
            });

            if (!existingMembership) {
              const membership = new Membership({
                student: student._id,
                year: year,
                club: club._id,
                institution: institution._id,
                amount: amount,
                statusMembership: 'activo',
                january: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                february: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                march: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                april: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                may: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                june: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                july: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                august: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                september: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                october: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                november: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
                december: { status: 'pendiente', recipe: null, paymentType: null, paymentDate: null, paymentPrice: null },
              });

              memberships.push(membership.save());
            } else {
              console.log(
                `Membresía ya existe para el estudiante ${student._id} en el club ${club._id} para el año ${year}`
              );
            }
          }
        } else {
          console.warn(
            `Club ${club.name} no tiene estudiantes o no es un array.`
          );
        }
      }

      const savedMemberships = await Promise.all(memberships);

      return res
        .status(201)
        .json({
          message: 'Membresías creadas exitosamente',
          memberships: savedMemberships,
        });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al crear las membresías', error });
    }
  },

  async updateMembershipAmount(req, res) {
    const { clubId, amount } = req.params;

    try {
      if (!clubId || !amount) {
        return res
          .status(400)
          .json({ message: 'El clubId y el amount son obligatorios' });
      }

      const memberships = await Membership.find({
        club: clubId,
      });

      if (!memberships || memberships.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron membresías para el club especificado',
        });
      }

      const updatedMemberships = await Promise.all(
        memberships.map(async membership => {
          membership.amount = amount;
          return membership.save();
        })
      );

      return res.status(200).json({
        message:
          'El campo amount se actualizó correctamente en todas las membresías del club',
        updatedMemberships,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al actualizar el campo amount', error });
    }
  },

  async getMembershipsPlayersClub(req, res) {
    const { clubId, year } = req.params;

    try {
      if (!clubId || !year) {
        return res
          .status(400)
          .json({ message: 'El clubId y el year son obligatorios' });
      }

      const club = await Club.findById(clubId).populate('students');

      if (!club) {
        return res.status(404).json({ message: 'Club no encontrado' });
      }

      const studentIds = club.students.map(student => student._id);

      const memberships = await Membership.find({
        club: clubId,
        year: year,
        student: { $in: studentIds },
      });

      const totalStudents = studentIds.length;
      const totalMemberships = memberships.length;
      const allStudentsHaveMemberships = totalStudents === totalMemberships;

      if (!memberships || memberships.length === 0) {
        return res.status(404).json({
          message:
            'No se encontraron membresías para los estudiantes del club en el año especificado',
        });
      }

      return res.status(200).json({
        message: 'Membresías encontradas',
        memberships,
        allStudentsHaveMemberships,
        missingStudents: totalStudents - totalMemberships,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al buscar las membresías', error });
    }
  },
};

module.exports = membershipController;
