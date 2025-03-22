import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide course title"],
      trim: true,
      maxLength: [100, "Title can not be more than 100 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxLength: [100, "Subtitle can not be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide course category"],
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Please select correct level for course",
      },
      default: "beginner",
    },
    price: {
      type: Number,
      required: [true, "Course Price is Required"],
      min: [0, "Course price must be non negative number"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course Thumbnail is reqired"],
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course instructor is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.virtual("averageRating").get(function () {
  return 0; //placeholder assignment
});

courseSchema.pre("save", function () {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }
  next();
});

export const Course = mongoose.model("Course", courseSchema);
