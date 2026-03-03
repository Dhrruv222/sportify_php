const jwt = require('jsonwebtoken');

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "No autorizado. Token faltante." });
            }

            const token = authHeader.split(' ')[1];

            //Check if the token is valid and has not expired
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            //'req' stores user data for future request handlers.
            req.user = decoded;

            // RBAC (Checks permisions based on role)
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    status: "error", 
                    message: `Access denied. Role required: ${allowedRoles.join(' o ')}` 
                });
            }
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

module.exports = authorize;