import mongoose from "mongoose";

const connectDB = () => {

    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
        console.log("MongoDB Connected");
        })
        .catch((err) => {
            console.log("MongoDB Connection Error: ", err);
        });
};

export default connectDB;