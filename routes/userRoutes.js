const router = require("express").Router();
const { createUserWithApiKey, getAllUsers } = require("../controllers/userController");
const authAdmin = require("../middleware/authAdmin");

// DEBUG
console.log("DEBUG createUserWithApiKey =", createUserWithApiKey);
console.log("DEBUG getAllUsers =", getAllUsers);
console.log("DEBUG authAdmin =", authAdmin);

router.post("/create", createUserWithApiKey);
router.get("/", authAdmin, getAllUsers);

module.exports = router;
