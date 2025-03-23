import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "course reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Purchase amount is required"],
      min: [0, "Purchase amount can not be negative"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Please select correct status for course purchase",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "payment method is required"],
    },
    paymentId: {
      type: String,
      required: [true, "payment Id is required"],
    },
    refundId: {
      type: String,
    },
    refundAmound: {
      type: Number,
      min: [0, "Refund amount can not be negative"],
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

coursePurchaseSchema.index({ user: 1, course: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

coursePurchaseSchema.virtual("isRefundable").get(function () {
  if (this.status !== "completed") return false;
  const thirtyDayPerios = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDayPerios;
});

//method ot process refund
coursePurchaseSchema.methods.processRefund = async function (reason, amount) {
  this.status = "refunded";
  this.reason = reason;
  this.refundAmound = amount || this.amount;
  return this.save();
};

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);

