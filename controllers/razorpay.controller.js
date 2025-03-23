import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model";
import { CoursePurchase } from "../models/coursePurchase.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    const newPurchase = new CoursePurchase({
      course: courseId,
      user: userId,
      amount: course.price,
      status: "pending",
    });

    const orderOptions = {
      amount: course.price * 100, //amount in smallest currency unit which is paise
      currency: "INR",
      receipt: `course_${courseId}`, //unique receipt number
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const myOrder = await razorpay.orders.create(orderOptions);

    newPurchase.paymentId = myOrder.id;
    await newPurchase.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: myOrder,
      course: {
        name: course.title,
        description: course.description,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Invalid payment" });
    }

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id,
    });
    if (!purchase) {
      return res.status(400).json({ message: "Purchase record not found" });
    }

    purchase.status = "completed";
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      courseId: purchase.courseId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
