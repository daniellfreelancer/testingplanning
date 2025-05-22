const bcryptjs = require("bcryptjs");
const UserGym = require("../models/gymUsers");
const Gym = require("../models/gym");
const jwt = require("jsonwebtoken");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Joi = require("joi");


const gymUserController = {

    createGym : async (req, res) =>{

        try {
            const gym = await Gym.create(req.body)
            res.status(200).json({gym})
        } catch (error) {
            res.status(400).json({error})
        }
    },
    getAllGyms : async (req, res) => {
        try {
            const gyms = await Gym.find()
            res.status(200).json({gyms})
        } catch (error) {
            res.status(400).json({error})
        }
    },
    getGymById : async (req, res) => {
        try {
            const gym = await Gym.findById(req.params.id)
            res.status(200).json({gym})
        } catch (error) {
            res.status(400).json({error})
        }
    },
    updateGym: async (req, res) =>{
        try {
            const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, {new: true})
            res.status(200).json({gym})
        } catch (error) {
            res.status(400).json({error})
        }
    },
    deleteGym: async (req, res) => {
        try {
            const gym = await Gym.findByIdAndDelete(req.params.id)
            res.status(200).json({gym})
        } catch (error) {
            res.status(400).json({error})
        }
    }
}

module.exports = gymUserController