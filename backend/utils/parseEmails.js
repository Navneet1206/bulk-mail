const fs = require('fs');
const csv = require('csv-parser');
const validator = require('validator');

const parseEmails = (filePath, fileType) => {
  return new Promise((resolve, reject) => {
    const emails = [];
    
    if (fileType === '.csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const email = Object.values(row)[0];
          if (validator.isEmail(email)) emails.push(email);
        })
        .on('end', () => resolve(emails))
        .on('error', (err) => reject(err));
    } else if (fileType === '.txt') {
      const content = fs.readFileSync(filePath, 'utf8');
      const emailList = content.split('\n').map(line => line.trim()).filter(email => validator.isEmail(email));
      resolve(emailList);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};

module.exports = parseEmails;