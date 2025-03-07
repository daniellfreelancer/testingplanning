const mongoose = require("mongoose");

const resumeVMTrainingSchema = new mongoose.Schema(
  {
    byTeacher: { type: mongoose.Types.ObjectId, ref: "user" },
    plannerClass: {
      type: mongoose.Types.ObjectId,
      ref: "sportPlanification",
      required: false,
    },
    sportCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "sportCategory",
      required: false,
    },
    elapsedClassTime: { type: Number },
    startClassTime: { type: String },
    endClassTime: { type: String },
    imgFirstVMClass: { type: String },
    imgSecondVMClass: { type: String },
    imgThirdVMClass: { type: String },
    fitData: { type: Array, required: false },
    presentStudents: { type: Array },
    evaluationNotation: { type: Array },
    observationsClass: { type: Array },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("resumeVMTraining", resumeVMTrainingSchema);
