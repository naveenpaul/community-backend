const bcrypt = require('bcrypt');

function resetPassword(emailId, newPassword) {
  console.log('resetting password for:', emailId)

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return null; }
    bcrypt.hash(newPassword.trim(), salt, (err, hash) => {
      if (err) { return null; }
      console.log('hash:', hash)
    });
  });
}

function main() {
    const args = process.argv;
    console.log('argemetns:', args)

    if (args.length != 4) {
        console.log('pass valid arguments');     
        process.exit(0);
    }

    resetPassword(args[2], args[3]) 
}

main()