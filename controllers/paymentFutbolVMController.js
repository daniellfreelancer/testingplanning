const PaymentFutbolVM = require('../models/paymentFutbolVM');

const paymentFutbolVMController = {

    createPaymentTicketFutbolVM: async (req, res) => {

        try {
            const newPaymentFutbolVM = new PaymentFutbolVM(req.body);

            await newPaymentFutbolVM.save();

            return res.status(201).json({ message: 'Pago generado exitosamente', paymentFutbolVM: newPaymentFutbolVM });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al generar el pago', error });
        }

    },

    getPaymentTicketFutbolVMByFutbolSchool: async (req, res) => {
        try {
            const { futbolSchoolId } = req.params;
            const paymentTicketsFutbolVM = await PaymentFutbolVM.find({ futbolSchool: futbolSchoolId });
            return res.status(200).json({ message: 'Pagos generados exitosamente', paymentTicketsFutbolVM });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener los pagos', error });
        }
    },
    getPaymentTicketFutbolVMByStudent: async (req, res) => {
        try {
            const { studentId } = req.params;
            const paymentTicketsFutbolVM = await PaymentFutbolVM.find({ student: studentId }).sort({ createdAt: -1 });
            return res.status(200).json({ message: 'Pagos generados exitosamente', paymentTicketsFutbolVM });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener los pagos', error });
        }
    },
    updateManualPaymentTicketFutbolVM: async (req, res) => {
        try {
            const { paymentTicketFutbolVMId } = req.params;
            const { status, paymentType, paymentPrice, recipe, paymentDate } = req.body;
            const paymentTicketFutbolVM = await PaymentFutbolVM.findByIdAndUpdate(paymentTicketFutbolVMId, { status, paymentType, paymentPrice, recipe, paymentDate }, { new: true });
            return res.status(200).json({ message: 'Pago actualizado exitosamente', paymentTicketFutbolVM });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al actualizar el pago', error });
        }
    },
    getPaymentTicketFutbolVMByInstitution: async (req, res) => {
        try {
            const { institutionId } = req.params;
            const paymentTicketsFutbolVM = await PaymentFutbolVM.find({ institution: institutionId }).sort({ createdAt: -1 }).populate('student', { name: 1, lastName: 1, rut: 1 })
            .populate('futbolSchool', { name: 1 });
            return res.status(200).json({ message: 'Pagos generados exitosamente', paymentTicketsFutbolVM });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener los pagos', error });
        }
    },



}

module.exports = paymentFutbolVMController;