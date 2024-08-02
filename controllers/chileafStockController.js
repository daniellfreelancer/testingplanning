const ChileafStock = require('../models/chileafStock')


const chileafStockController = {

    //agregar nuevo stock
    createChileafStock : async (req, res) => {
        try {
            let newStock = await new ChileafStock(req.body).save()

            if (newStock) {
                res.status(200).json({
                    message: "Stock registrado con exito",
                    data: newStock
                })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error al registrar el stock" })
        }

    },
    updateChileafStock : async (req, res) => {
        const id = req.params.id;
        const update = req.body;

        try {
            let stock = await ChileafStock.findByIdAndUpdate(id, update, { new: true })

            if (stock) {
                res.status(200).json({
                    message: "Stock actualizado con exito",
                    data: stock
                })
            } else {
                res.status(404).json({ message: "Stock no encontrado" })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error al actualizar el stock" })
        }
    },
    deleteChileafStock : async ( req, res) => {
        const id = req.params.id;

        try {
            let stock = await ChileafStock.findByIdAndDelete(id)

            if (stock) {
                res.status(200).json({
                    message: "Stock eliminado con exito"
                })
            } else {
                res.status(404).json({ message: "Stock no encontrado" })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error al eliminar el stock" })
        }
    },
    getAllChileafStock: async (req, res) => {
        try {
            const stocks = await ChileafStock.find()

            if (stocks) {
                res.status(200).json({
                    message: "Todos los stocks obtenidos con exito",
                    data: stocks
                })
            } else {
                res.status(404).json({ message: "No hay stocks registrados" })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error al obtener los stocks" })
        }
    },
    getChileafStockByHubId : async (req, res) => {
        const hubId = req.params.hubId;

        try {
            const stocks = await ChileafStock.find({ hubId: hubId })

            if (stocks) {
                res.status(200).json({
                    message: "Stocks obtenidos con exito para el hubId " + hubId,
                    data: stocks
                })
            } else {
                res.status(404).json({ message: "No hay stocks registrados para el hubId " + hubId })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Error al obtener los stocks por hubId" })
        }
    }

}


module.exports = chileafStockController;