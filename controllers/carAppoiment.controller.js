const Appointment = require("../models/carAppoiment");

const appointmentController = {
  createAppointment: async (req, res) => {
    const { athlete, sportCategory, evaluationType, date, place, notes, type } =
      req.body;

    try {
      const newAppointment = new Appointment({
        athlete,
        sportCategory,
        evaluationType,
        date,
        notes,
        place,
        type

      });
      await newAppointment.save();
      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAvailableDates: async (req, res) => {
    const { evaluationType, date } = req.params;
    try {
        // Convertir la fecha recibida a un objeto Date
        const targetDate = new Date(date);
    
        // Obtener el inicio y el final del día
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
    
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
    
        // Buscar las citas agendadas para el tipo de evaluación y la fecha específica
        const appointments = await Appointment.find({
          evaluationType,
          date: {
            $gte: startOfDay, // Mayor o igual al inicio del día
            $lte: endOfDay,   // Menor o igual al final del día
          },
        }).select('date evaluationType'); // Seleccionar solo el campo 'time'
    
        // Extraer las horas ocupadas
        const occupiedTimes = appointments.map(appointment => [appointment.date, appointment.evaluationType]);
    
        // Devolver las horas ocupadas
        res.status(200).json({ occupiedTimes });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }

  },
  getMyAppointments: async (req, res) => {
    const { athleteId } = req.params;

    try {
      const appointments = await Appointment.find({ athlete: athleteId }).sort({
        date: 1,
      });
      res.status(200).json(appointments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateAppointment: async (req, res) => {
    const { appointmentId } = req.params;
    const updateData = req.body;

    try {
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true }
      );
      res.status(200).json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteAppointment: async (req, res) => {
    const { appointmentId } = req.params;

    try {
      await Appointment.findByIdAndDelete(appointmentId);
      res.status(200).json({ message: "Agenda eliminada con éxito" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAppointmentsByCategory: async (req, res) => {
    const { workshopId } = req.params;

    try {
      const appointments = await Appointment.find({
        sportCategory: workshopId,
      }).sort({ date: 1 });
      res.status(200).json(appointments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAppointmentsByEvaluationType: async (req, res) => {
    const { evaluationType } = req.params;

    try {
      const appointments = await Appointment.find({ evaluationType }).sort({
        date: 1,
      });
      res.status(200).json(appointments);
    } catch (error) { 
      res.status(400).json({ message: error.message });
    }

  },
  getAppointmentByType: async (req, res) =>{

    const {type} = req.params

    try {
        const appointments = await Appointment.find({type}).sort({date: 1})

        res.status(200).json(appointments)
        
    } catch (error) {
        res.status(400).json({message: error.message})
        
    }
  }, getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.find().sort({ date: 1 });
      res.status(200).json(appointments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
};

module.exports = appointmentController;
