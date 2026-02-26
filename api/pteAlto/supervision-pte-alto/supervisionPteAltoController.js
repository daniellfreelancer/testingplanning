const SupervisionPteAlto = require('./supervisionPtealto');
const ComplejosDeportivosPteAlto = require('../complejos-deportivos/complejosDeportivosPteAlto');
const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const SedesDeportivasPteAlto = require('../sedes-deportivas/sedesDeportivasPteAlto');
const TalleresDeportivosPteAlto = require('../talleres-deportivos/talleresDeportivosPteAlto');

const supervisionPteAltoController = {

    crearSupervisionComplejoPteAlto: async (req, res) => {
        // Crea la supervision para un complejo deportivo PTe Alto, lo asocia  al complejo deportivo
        try {
            const {idUsuario } = req.params;
            const { observaciones, fecha, complejoDeportivo } = req.body;

            const supervision = new SupervisionPteAlto({
                usuario: idUsuario,
                fecha: fecha,
                observaciones: observaciones,
                supervisionComplejos: complejoDeportivo,
            });

            await supervision.save();
            const complejoDeportivoDoc = await ComplejosDeportivosPteAlto.findById(complejoDeportivo);
            complejoDeportivoDoc.supervision.push(supervision._id);
            await complejoDeportivoDoc.save();
            res.status(201).json({ message: 'Supervisión PTE Alto creada correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la supervision', error });
        }
    },
    obtenerSupervisionComplejoPteAlto: async (req, res) => {
        try {
            const { idComplejoDeportivo } = req.params;
            const supervision = await SupervisionPteAlto.find({ supervisionComplejos: idComplejoDeportivo }).populate('usuario', 'nombre apellido email rut telefono').sort({ fecha: -1 });
            res.status(200).json({ message: 'Supervisión PTE Alto obtenida correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la supervision', error });
        }
    },
    crearSupervisionEspacioPteAlto: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { observaciones, fecha, espacioDeportivo } = req.body;
            const supervision = new SupervisionPteAlto({
                usuario: idUsuario,
                fecha: fecha,
                observaciones: observaciones,
                supervisionEspacio: espacioDeportivo,
            });
            await supervision.save();
            const espacioDeportivoDoc = await EspaciosDeportivosPteAlto.findById(espacioDeportivo);
            espacioDeportivoDoc.supervision.push(supervision._id);
            await espacioDeportivoDoc.save();
            res.status(201).json({ message: 'Supervisión PTE Alto creada correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la supervision', error });
        }
    },
    obtenerSupervisionEspacioPteAlto: async (req, res) => {
        try {
            const { idEspacioDeportivo } = req.params;
            const supervision = await SupervisionPteAlto.find({ supervisionEspacio: idEspacioDeportivo }).populate('usuario', 'nombre apellido email rut telefono').sort({ fecha: -1 });
            res.status(200).json({ message: 'Supervisión PTE Alto obtenida correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la supervision', error });
        }
    },
    crearSupervisionSedePteAlto: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { observaciones, fecha, sede } = req.body;
            const supervision = new SupervisionPteAlto({
                usuario: idUsuario,
                fecha: fecha,
                observaciones: observaciones,
                supervisionSede: sede,
            });
            await supervision.save();
            const sedeDoc = await SedesDeportivasPteAlto.findById(sede);
            sedeDoc.supervision.push(supervision._id);
            await sedeDoc.save();
            res.status(201).json({ message: 'Supervisión PTE Alto creada correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la supervision', error });
        }
    },
    obtenerSupervisionSedePteAlto: async (req, res) => {
        try {
            const { idSede } = req.params;
            const supervision = await SupervisionPteAlto.find({ supervisionSede: idSede }).populate('usuario', 'nombre apellido email rut telefono').sort({ fecha: -1 });
            res.status(200).json({ message: 'Supervisión PTE Alto obtenida correctamente', supervision });


        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la supervision', error });
        }
    },
    crearSupervisionTallerPteAlto: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { observaciones, fecha, taller } = req.body;
            const supervision = new SupervisionPteAlto({
                usuario: idUsuario,
                fecha: fecha,
                observaciones: observaciones,
                supervisionTaller: taller,
            });
            await supervision.save();
            const tallerDoc = await TalleresDeportivosPteAlto.findById(taller);
            tallerDoc.supervision.push(supervision._id);
            await tallerDoc.save();
            res.status(201).json({ message: 'Supervisión PTE Alto creada correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la supervision', error });
        }
    },
    obtenerSupervisionTallerPteAlto: async (req, res) => {
        try {
            const { idTaller } = req.params;
            const supervision = await SupervisionPteAlto.find({ supervisionTaller: idTaller }).populate('usuario', 'nombre apellido email rut telefono').sort({ fecha: -1 });
            res.status(200).json({ message: 'Supervisión PTE Alto obtenida correctamente', supervision });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la supervision', error });
        }
    },
}

module.exports = supervisionPteAltoController;