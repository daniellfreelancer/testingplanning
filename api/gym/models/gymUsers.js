const mongoose = require("mongoose");

const userGym = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
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
    rut: {
      type: String,
      required: [true, "El rut es obligatorio"],
      trim: true,
      match: [
        /^(\d{7,8})-([\dkK])$/,
        "Formato de RUT inválido (ej: 12345678-9)",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
      validate: {
        validator: (date) => date < new Date(),
        message: "La fecha de nacimiento debe ser pasada",
      },
    },
    gender: {
      type: String,
      enum: ["M", "F", "OTHER"],
    },
    membership: [{ type: Object }],
    membershipType: [{ type: String }],
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYED", "TRAINER", "USER"],
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifications: [
      {
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    from: {
      type: String,
      enum: ["google", "form", "facebook", null],
      default: null,
    }, // from google o formularios
    verified: {
      type: Boolean,
      default: false,
    },
    code: { type: String },
    logged: { type: String },
    imgUrl: { type: String },
    trainerSpecialty: {
      type: String,
      required: function () {
        return this.role === "TRAINER";
      },
    },
    employeePosition: {
      type: String,
      required: function () {
        return this.role === "EMPLOYED";
      },
    },
    documents: {
      idFront: String,
      idBack: String,
      otherDocs: [String],
    },
    password:[{type: String, required: true}],
  },
  {
    timestamps: true,
  }
);

const USERGYM = mongoose.model("userGym", userGym);

module.exports = USERGYM;
