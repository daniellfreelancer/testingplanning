const Membership = require('../models/membershipFutbol');
// const { S3Client, PutObjectCommand, PutObjectRetentionCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const crypto = require('crypto')
// const sharp = require('sharp'); // tampoco se usa aquí
const Institution = require('../models/institution');
const Club = require('../models/club');
const Player = require('../models/student');
const { uploadMulterFile } = require('../utils/s3Client'); // helper centralizado S3
const Student = require('../models/student');

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
// crear ticket de pago para la membresía
  async createFutbolMembershipTicket(req, res) {
    const { year, institutionId, amount, studentId, futbolSchoolId } = req.body;


    /**
     * year: año de la membresía
     * institutionId: id de la institución
     * amount: cantidad de la membresía
     * studentId: id del estudiante
     * futbolSchoolId: id del programa de futbol
     */
    try {


/** consultar el mes actual para poder generar el mes actual mas los meses restantes hasta diciembre */

      const currentMonthIndex = new Date().getMonth();
      // los meses deben estar en ingles
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

      // Crear objeto con los meses desde el actual hasta diciembre
      const monthsData = {};
      for (let i = currentMonthIndex; i < months.length; i++) {
        monthsData[months[i]] = {
          status: 'pendiente',
          recipe: null,
          paymentType: null,
          paymentDate: null,
          paymentPrice: amount,
        };
      }

      const newMembership = new Membership({
        year: year,
        institution: institutionId,
        amount: amount,
        student: studentId,
        futbolSchool: futbolSchoolId,
        statusMembership: 'activo',
        ...monthsData,
      });

      await newMembership.save();

      return res
        .status(201)
        .json({ message: 'Membresía creada exitosamente', membership: newMembership });
 
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al crear las membresías', error });
    }
  },
  // consultar por el mes actual para poder pagar la membresia
  async getCurrentMonthtoPayMembership(req, res){

    try {

      // primero buscamos el estudiante por rut

      const { rut } = req.params;


      // en caso de que el rut tenga puntos o guiones, se debe remover
      const cleanRut = rut.replace(/[.\-\s]/g, '');

      const student = await Student.findOne({ rut: cleanRut });

      if (!student) {
        return res.status(404).json({ message: 'El rut no se encuentra registrado en la base de datos, o contacte con el administrador para verificar esta informacion' });
      }

      // luego buscamos la membresia del estudiante
      const membership = await Membership.findOne({ student: student._id });

      if (!membership) {
        return res.status(404).json({ message: 'El estudiante no tiene una membresía activa, o contacte con el administrador para verificar esta informacion' });
      }

      let currentMonth = new Date().getMonth();

      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      
      currentMonth = months[currentMonth];


      // se debe seleccionar el mes actual de la membresia, para consultar monto, status, recibo, tipo de pago y fecha pago
      const currentMonthMembership = membership[currentMonth];

      if (!currentMonthMembership) {
        return res.status(404).json({ message: 'El mes actual no se encuentra registrado en la base de datos, o contacte con el administrador para verificar esta informacion' });
      }
    
      return res.status(200).json({
        message: 'El mes actual para poder pagar la membresía es: ',
        month: currentMonth,
        amount: currentMonthMembership.paymentPrice,
        status: currentMonthMembership.status,
        recipe: currentMonthMembership.recipe,
        paymentType: currentMonthMembership.paymentType,
        paymentDate: currentMonthMembership.paymentDate,
        futbolSchool: student?.program[0]
      });

    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Error al consultar el mes actual para poder pagar la membresía', error });
    }

  },

  async updateMembershipAmount(req, res) {
    const { membershipId } = req.params;
    const { amount } = req.body;

    try {

      // debe buscar y actualizar el campo monto de la membresia y de todos los meses restantes hasta diciembre
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const monthsData = {};
      for (let i = 0; i < months.length; i++) {
        monthsData[months[i]] = { paymentPrice: amount };
      }

      // primero buscar la membresia por id
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      membership.amount = amount;
      for (let i = 0; i < months.length; i++) {
        membership[months[i]].paymentPrice = amount;
      }
      await membership.save();

      return res.status(200).json({ message: 'Membresía actualizada exitosamente', membership });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar la membresía', error });
    }
  },
  // actualizar el mes de la membresia
  async updateMembershipMonth(req, res){
    const { membershipId, month, status, paymentType, paymentPrice, recipe } = req.body;
    try {
      const membership = await Membership.findByIdAndUpdate(membershipId, { [month]: { status, paymentType, paymentPrice, paymentDate: new Date(), recipe: recipe || null } }, { new: true });
      
      return res.status(200).json({ message: 'Membresía actualizada exitosamente', membership });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar la membresía', error });
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
  // consultar las membresias de un estudiante
  async getMembershipsByStudent(req, res) {
    const { studentId } = req.params;
    try {
      const memberships = await Membership.find({ student: studentId })
      .populate('student', {
        name: 1,
        lastName: 1,
        email: 1,
        imgUrl: 1,
        phone: 1,
        rut: 1,
      },)
      return res.status(200).json({ memberships });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al buscar las membresías', error });
    }
  },
  async getMembershipsByInstitution(req, res) {
    const { institutionId } = req.params;
    try {
      const memberships = await Membership.find({ institution: institutionId })
      .populate('student', {
        name: 1,
        lastName: 1,
        email: 1,
        imgUrl: 1,
        phone: 1,
        rut: 1,
      })
      .populate('futbolSchool', {
        name: 1,
      })
      return res.status(200).json({ memberships });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al buscar las membresías', error });
    }
  },

  // Actualizar pago manual (transferencia, efectivo, etc.)
  async updateManualPayment(req, res) {
    const { membershipId, month, paymentType, paymentPrice, recipe, notes } = req.body;

    try {
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      const validMonths = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];

      if (!validMonths.includes(month)) {
        return res.status(400).json({ message: 'Mes no válido' });
      }

      const validPaymentTypes = ['TRANSFERENCIA', 'EFECTIVO', 'APIO', 'WEBPAY', 'OTRO'];
      if (!validPaymentTypes.includes(paymentType)) {
        return res.status(400).json({ message: 'Tipo de pago no válido' });
      }

      membership[month].status = 'pagado';
      membership[month].paymentType = paymentType;
      membership[month].paymentPrice = paymentPrice || membership.amount;
      membership[month].paymentDate = new Date();
      membership[month].recipe = recipe || null;
      if (notes) {
        membership[month].notes = notes;
      }

      await membership.save();

      return res.status(200).json({ 
        message: 'Pago registrado exitosamente', 
        membership 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al registrar el pago', error });
    }
  },

  // Obtener estadísticas de pagos por institución
  async getPaymentStatsByInstitution(req, res) {
    const { institutionId } = req.params;
    const { year, month } = req.query;

    try {
      const currentYear = year || new Date().getFullYear().toString();
      const memberships = await Membership.find({ 
        institution: institutionId,
        year: currentYear
      })
      .populate('student', { name: 1, lastName: 1, rut: 1 })
      .populate('futbolSchool', { name: 1 });

      const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
      
      // Calcular estadísticas generales
      let totalPendiente = 0;
      let totalPagado = 0;
      let countPendiente = 0;
      let countPagado = 0;
      
      // Estadísticas por tipo de pago
      const paymentTypeStats = {
        TRANSFERENCIA: { count: 0, amount: 0 },
        EFECTIVO: { count: 0, amount: 0 },
        APIO: { count: 0, amount: 0 },
        WEBPAY: { count: 0, amount: 0 },
        OTRO: { count: 0, amount: 0 }
      };

      // Si se especifica un mes, filtrar solo ese mes
      const monthsToCheck = month ? [month] : months;

      memberships.forEach(membership => {
        monthsToCheck.forEach(m => {
          if (membership[m]) {
            const monthData = membership[m];
            const price = monthData.paymentPrice || membership.amount || 0;
            
            if (monthData.status === 'pagado') {
              totalPagado += price;
              countPagado++;
              
              // Contar por tipo de pago
              const pType = monthData.paymentType || 'OTRO';
              if (paymentTypeStats[pType]) {
                paymentTypeStats[pType].count++;
                paymentTypeStats[pType].amount += price;
              }
            } else if (monthData.status === 'pendiente') {
              totalPendiente += price;
              countPendiente++;
            }
          }
        });
      });

      return res.status(200).json({
        stats: {
          totalPendiente,
          totalPagado,
          countPendiente,
          countPagado,
          paymentTypeStats,
          totalMemberships: memberships.length
        },
        memberships
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al obtener estadísticas', error });
    }
  }
};

module.exports = membershipController;
