const USERS = require("../models/admin");
const STUDENTS = require("../models/student");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  RekognitionClient,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} = require("@aws-sdk/client-rekognition");

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_BUCKET_REGION_REKO,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_REKO,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_REKO,
  },
});

//cliente AWS S3 para foto de perfil
const clientAWSProfile = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// cliente AWS S3 para foto de rekognition
const clientAWSRekognition = new S3Client({
  region: process.env.AWS_BUCKET_REGION_REKO,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_REKO,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_REKO,
  },
});

const imgIdentifier = () => crypto.randomBytes(32).toString("hex");

const rekoController = {
  verificarUsuario: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }

      const fileContent = req.file.buffer;

      const params = {
        CollectionId: process.env.COLLECTION_AWS, // Cambia por el nombre real de tu colección
        Image: { Bytes: fileContent },
        MaxFaces: 1,
        FaceMatchThreshold: 90,
      };
      const command = new SearchFacesByImageCommand(params);
      const data = await rekognitionClient.send(command);

      const match = data?.FaceMatches?.[0];

      if (!match) {
        return res.status(404).json({
          message: "Usuario no registrado",
          success: false,
        });
      }
      // Extraer el rut desde ExternalImageId quitando extensión
      const externalImageId = match.Face?.ExternalImageId || "";
      const rut = externalImageId.split(".")[0];

      // Buscar en ambas colecciones
      //   const user = await USERS.findOne({ rut });
      //   const student = await STUDENTS.findOne({ rut });

      const [user, student] = await Promise.all([
        USERS.findOne({ rut }),
        STUDENTS.findOne({ rut }),
      ]);

      if (!user && !student) {
        return res.status(404).json({
          message: `No se encontró el usuario con rut ${rut}`,
          success: false,
        });
      }

      res.status(200).json({
        message: "Usuario reconocido exitosamente",
        success: true,
        rut,
        persona: user || student,
        data: data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },
  registrarUsuario: async (req, res) => {
    const { rut, name, lastName, email, role, imgUrl } = req.body;

    let password = "vitalmove";

    try {
      //validar los rut USER
      const rutExists = await USERS.findOne({ rut });
      if (rutExists) {
        return res.status(400).json({
          message: "El rut ya se encuentra registrado",
          success: false,
        });
      }

      //validar los rut Students
      const rutExistsStudent = await STUDENTS.findOne({ rut });
      if (rutExistsStudent) {
        return res.status(400).json({
          message: "El rut ya se encuentra registrado",
          success: false,
        });
      }

      if (
        role == "SUAD" ||
        role == "SUPR" ||
        role == "SUEM" ||
        role == "SUAF" ||
        role == "SUPF"
      ) {
        // const user = await USERS.findOne({ rut });
        // if (user) {
        //   return res.status(400).json({
        //     message: "El usuario ya se encuentra registrado",
        //     success: false,
        //   });
        // }

        const newUser = new USERS({
          rut,
          name,
          lastName,
          email,
          role,
          password: bcryptjs.hashSync(password, 10),
        });

        if (req.file) {
          const fileContent = req.file.buffer;
          const extension = req.file.originalname.split(".").pop();
          const fileName = `${rut}.${extension}`;
          const fileNameProfile = `${imgIdentifier()}.${extension}`;

          //foto para S3 perfil
          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileNameProfile,
            Body: fileContent,
          };

          //foto para s# rekognition
          const uploadParamsReko = {
            Bucket: process.env.AWS_BUCKET_NAME_REKO,
            Key: fileName,
            Body: fileContent,
          };

          // Subir el archivo a S3
          const uploadCommandProfile = new PutObjectCommand(uploadParams);
          await clientAWSProfile.send(uploadCommandProfile);

          const uploadCommandRekognition = new PutObjectCommand(
            uploadParamsReko
          );
          await clientAWSRekognition.send(uploadCommandRekognition);

          const indexParams = {
            CollectionId: process.env.COLLECTION_AWS, // Ej: "reconocimiento-facial"
            Image: {
              S3Object: {
                Bucket: process.env.AWS_BUCKET_NAME_REKO,
                Name: fileName,
              },
            },
            ExternalImageId: fileName, // Puedes usar rut o nombre como identificador
            DetectionAttributes: [],
          };

          try {
            const indexCommand = new IndexFacesCommand(indexParams);
            const indexResponse = await rekognitionClient.send(indexCommand);
            console.log("✅ Rostro indexado en Rekognition:", indexResponse);
          } catch (indexError) {
            console.error(
              "❌ Error al indexar rostro en Rekognition:",
              indexError
            );
            return res.status(500).json({
              message: "Error al indexar rostro en Rekognition",
              details: indexError.message || indexError,
            });
          }

          newUser.imgUrl = fileNameProfile;
          newUser.imgRekognition = fileName;
        }

        await newUser.save();

        res.status(200).json({
          message: "Usuario registrado con exito",
          success: true,
          data: newUser,
        });
      } else if (role == "ESTU" || role == "GUES" || role == "ATHL") {
        // const user = await STUDENTS.findOne({ rut });

        // if (user) {
        //   return res.status(400).json({
        //     message: "El usuario ya se encuentra registrado",
        //     success: false,
        //   });
        // }

        const newStudent = new STUDENTS({
          rut,
          name,
          lastName,
          email,
          role,
          password: bcryptjs.hashSync(password, 10),
        });

        if (req.file) {
          const fileContent = req.file.buffer;
          const extension = req.file.originalname.split(".").pop();
          const fileName = `${rut}.${extension}`;
          const fileNameProfile = `${imgIdentifier()}.${extension}`;

          //foto para S3 perfil
          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileNameProfile,
            Body: fileContent,
          };

          //foto para s# rekognition
          const uploadParamsReko = {
            Bucket: process.env.AWS_BUCKET_NAME_REKO,
            Key: fileName,
            Body: fileContent,
          };

          // Subir el archivo a S3
          const uploadCommandProfile = new PutObjectCommand(uploadParams);
          await clientAWSProfile.send(uploadCommandProfile);

          const uploadCommandRekognition = new PutObjectCommand(
            uploadParamsReko
          );
          await clientAWSRekognition.send(uploadCommandRekognition);

          const indexParams = {
            CollectionId: process.env.COLLECTION_AWS, // Ej: "reconocimiento-facial"
            Image: {
              S3Object: {
                Bucket: process.env.AWS_BUCKET_NAME_REKO,
                Name: fileName,
              },
            },
            ExternalImageId: fileName, // Puedes usar rut o nombre como identificador
            DetectionAttributes: [],
          };

          try {
            const indexCommand = new IndexFacesCommand(indexParams);
            const indexResponse = await rekognitionClient.send(indexCommand);
            console.log("✅ Rostro indexado en Rekognition:", indexResponse);
          } catch (indexError) {
            console.error(
              "❌ Error al indexar rostro en Rekognition:",
              indexError
            );
            return res.status(500).json({
              message: "Error al indexar rostro en Rekognition",
              details: indexError.message || indexError,
            });
          }
          newStudent.imgUrl = fileNameProfile;
          newStudent.imgRekognition = fileName;
        }

        await newStudent.save();

        res.status(200).json({
          message: "Usuario registrado con exito",
          success: true,
          data: newStudent,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
  subirFotoUsuarioRegistrado: async (req, res) => {
    const { rut } = req.body;

    try {
      const [user, student] = await Promise.all([
        USERS.findOne({ rut }),
        STUDENTS.findOne({ rut }),
      ]);

      if (!user && !student) {
        return res.status(404).json({
          message: "Usuario no encontrado",
          success: false,
        });
      }

      if (user) {
        if (req.file) {
          const fileContent = req.file.buffer;
          const extension = req.file.originalname.split(".").pop();
          const fileName = `${rut}.${extension}`;

          //foto para s# rekognition
          const uploadParamsReko = {
            Bucket: process.env.AWS_BUCKET_NAME_REKO,
            Key: fileName,
            Body: fileContent,
          };

          // Subir el archivo a S3
          const uploadCommandRekognition = new PutObjectCommand(
            uploadParamsReko
          );
          await clientAWSRekognition.send(uploadCommandRekognition);

          const indexParams = {
            CollectionId: process.env.COLLECTION_AWS, // Ej: "reconocimiento-facial"
            Image: {
              S3Object: {
                Bucket: process.env.AWS_BUCKET_NAME_REKO,
                Name: fileName,
              },
            },
            ExternalImageId: fileName, // Puedes usar rut o nombre como identificador
            DetectionAttributes: [],
          };

          try {
            const indexCommand = new IndexFacesCommand(indexParams);
            const indexResponse = await rekognitionClient.send(indexCommand);
            console.log("✅ Rostro indexado en Rekognition:", indexResponse);

            //update user
            const userUpdate = await USERS.findOneAndUpdate(
              { rut },
              { new: true }
            );

            userUpdate.imgRekognition = fileName;

            await userUpdate.save();

            res.status(200).json({
              message: "Foto actualizada con exito",
              success: true,
              data: userUpdate,
            });
          } catch (indexError) {
            console.error(
              "❌ Error al indexar rostro en Rekognition:",
              indexError
            );
            return res.status(500).json({
              message: "Error al indexar rostro en Rekognition",
              details: indexError.message || indexError,
            });
          }
        }
      } else if (student) {
        if (req.file) {
          const fileContent = req.file.buffer;
          const extension = req.file.originalname.split(".").pop();
          const fileName = `${rut}.${extension}`;

          //foto para s# rekognition
          const uploadParamsReko = {
            Bucket: process.env.AWS_BUCKET_NAME_REKO,
            Key: fileName,
            Body: fileContent,
          };

          const uploadCommandRekognition = new PutObjectCommand(
            uploadParamsReko
          );
          await clientAWSRekognition.send(uploadCommandRekognition);

          const indexParams = {
            CollectionId: process.env.COLLECTION_AWS, // Ej: "reconocimiento-facial"
            Image: {
              S3Object: {
                Bucket: process.env.AWS_BUCKET_NAME_REKO,
                Name: fileName,
              },
            },
            ExternalImageId: fileName, // Puedes usar rut o nombre como identificador
            DetectionAttributes: [],
          };

          try {
            const indexCommand = new IndexFacesCommand(indexParams);
            const indexResponse = await rekognitionClient.send(indexCommand);
            console.log("✅ Rostro indexado en Rekognition:", indexResponse);

            //update user
            const studentUpdate = await STUDENTS.findOneAndUpdate(
              { rut },
              { new: true }
            );

            studentUpdate.imgRekognition = fileName;

            await studentUpdate.save();

            res.status(200).json({
              message: "Foto actualizada con exito",
              success: true,
              data: studentUpdate,
            });
          } catch (indexError) {
            console.error(
              "❌ Error al indexar rostro en Rekognition:",
              indexError
            );
            return res.status(500).json({
              message: "Error al indexar rostro en Rekognition",
              details: indexError.message || indexError,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

module.exports = rekoController;
