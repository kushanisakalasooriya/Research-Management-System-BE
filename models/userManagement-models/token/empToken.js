const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//generate token for employee
//it generate token using employee ID
const tokenSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "employeeRegistration", //Reference will be a employeeRegistration model
		unique: true,
	},
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: 3600 }, //token will expired after the 1 hour
});

module.exports = mongoose.model("empToken", tokenSchema);