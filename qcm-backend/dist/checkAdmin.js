"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_1 = __importDefault(require("./models/Admin"));
const MONGO_URI = "mongodb://127.0.0.1:27017/qcmdb";
async function run() {
    await mongoose_1.default.connect(MONGO_URI);
    const admins = await Admin_1.default.find();
    console.log("Admins trouvés :", admins);
    await mongoose_1.default.disconnect();
}
run().catch(console.error);
