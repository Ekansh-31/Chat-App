//jwt helps to autherise the user in the backend.only autherised users will be allowed to access the resourse
const jwt = require('jsonwebtoken');

const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;