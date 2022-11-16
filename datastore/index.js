const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    let newFile = path.join(exports.dataDir, id + '.txt');
    fs.writeFile(newFile, text, (err) => {
      if (err) {
        //throw ('error writing to do item');
        callback(new Error('error writing to do item'));
      } else {
        callback(null, {id: id, text: text});
      }
    })
  });
};

exports.readAll = (callback) => {

  const readdirPromised = Promise.promisifyAll(fs.readdir);

  return readdirPromised(exports.dataDir)
    .then((files) => {
      console.log('files: ', files);
      var readAllArr = [];
      for (var i = 0; i < files.length; i++) {
        var parseID = files[i].substring(0, files[i].length-4);
        readAllArr.push({id: parseID, text: parseID});
      }
      callback(readAllArr);
    })
    .catch((err) => {
      throw err;
    });


  // CALLBACK VERSION
  // var readAllArr = [];
  // fs.readdir(exports.dataDir, (err, files) => {
  //   for (var i = 0; i < files.length; i++) {
  //     var parseID = files[i].substring(0, files[i].length-4);
  //     readAllArr.push({id: parseID, text: parseID});
  //   }

  //   if (err) {
  //     throw ('error reading all');
  //   } else {
  //     callback (null, readAllArr);
  //   }
  // })
};

exports.readOne = (id, callback) => {
  const fileName = exports.dataDir + '/' + id + '.txt';

  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id, text: data});
  }})
};

exports.update = (id, text, callback) => {
  const fileName = exports.dataDir + '/' + id + '.txt';

  fs.open(fileName, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(fileName, text, 'utf8', (err, data) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { id, text });
        }})
      }
    }
  )
};

exports.delete = (id, callback) => {
  const fileName = exports.dataDir + '/' + id + '.txt';

  fs.unlink(fileName, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
