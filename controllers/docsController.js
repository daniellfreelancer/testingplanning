const User = require('../models/admin')
const bcryptjs = require('bcryptjs');
const crypto = require('crypto')

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')


const docsController = {

    idFrontUpload : async (req, res) => {


    },
    idFrontUpdate : async (req, res) => {


    },
    idBackUpload : async (req, res) => {

    },
    idBackUpdate : async (req, res) => {

    },
    idFrontDelete : async (req, res) => {

    },
    idBackDelete : async (req, res) => {

    },
    backgroundUpload : async (req, res) => {

    },
    backgroundUpdate : async (req, res) => {

    },
    backgroundDelete : async (req, res) => {

    },
    otherDocsUpload : async (req, res) => {

    },
    otherDocsUpdate : async (req, res) => {

    },
    otherDocsDelete : async (req, res) => {
        
    }




}

module.exports = docsController;