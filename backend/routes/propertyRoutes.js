const express = require("express");

const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");

const { validateProperty } = require("../middleware/validation");

const router = express.Router();

router.get("/", getProperties);

router.get("/:id", getPropertyById);

router.post("/", validateProperty, createProperty);

router.put("/:id", validateProperty, updateProperty);

router.delete("/:id", deleteProperty);

module.exports = router;