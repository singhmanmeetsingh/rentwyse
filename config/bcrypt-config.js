const bcrypt = require('bcrypt');

function hashPassword(password, callback) {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);
    callback(null, hashedPassword);
  });
}

module.exports = { hashPassword };
