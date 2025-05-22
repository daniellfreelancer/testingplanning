const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del gimnasio es obligatorio"],
      trim: true,
    },
    rut: {
      type: String,
      trim: true,
      match: [/^(\d{7,8})-([\dkK])$/, "Formato de RUT inválido (ej: 12345678-9)"],
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{9,15}$/, "Número de teléfono no válido"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email no válido",
      ],
    },
    logo: {
      type: String,
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "userGym",
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Debe haber al menos un administrador",
      },
    }],
    employees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "userGym",
    }],
    trainers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "userGym",
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "userGym",
    }],
    gymBranches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymBranch",
    }],
    gymClasses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymClass",
    }],
    gymCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymCourse",
    }],
    gymPayments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymPayment",
    }],
    gymMemberships: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymMembership",
    }],
    gymPOS: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymPOS",
    }],
    gymBenefits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymBenefit",
    }],
    gymTrainings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "gymTraining",
    }],
  },
  {
    timestamps: true,
  }
);

const Gym = mongoose.model("Gym", gymSchema);
module.exports = Gym;