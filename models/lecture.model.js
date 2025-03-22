import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide lecture title"],
      trim: true,
      maxLength: [100, "Title can not be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description can not be more than 1000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Please provide video url"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      require: [true, "Please provide public id for video management"],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: [true, "lecture order is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lectureSchema.pre("save", function () {
    if (this.duration) {
        this.duration = Math.round(this.duration * 100) / 100
        //this is an optional thing
    }
    next()
})

export const Lecture = mongoose.model("Lecture", lectureSchema);