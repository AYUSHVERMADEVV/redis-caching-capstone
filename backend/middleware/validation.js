function sanitizeText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/[<>]/g, "")
        .trim();
}

function validateProperty(req, res, next) {
    let { title, location, price, status } = req.body;

    title = sanitizeText(title);
    location = sanitizeText(location);
    status = sanitizeText(status);

    if (!title || !location || price === undefined || price === "") {
        return res.status(400).json({
            success: false,
            message: "Title, location and price are required."
        });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid positive number."
        });
    }

    const allowedStatuses = ["available", "sold", "pending"];

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid property status."
        });
    }

    req.body = {
        title,
        location,
        price: numericPrice,
        status: status || "available"
    };

    next();
}

module.exports = {
    sanitizeText,
    validateProperty
};