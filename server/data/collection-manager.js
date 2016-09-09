var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var Schema       = mongoose.Schema;
var dbConnection;
var models = {};
var schema = {};
var collectionsImported = false;

var createCollection = function(file) {
  var modelName = file.replace('.js','');
  var modulePath = './collections/' +modelName;
  var rawJson = require(modulePath);

  // create mongoose schema from definition
  var schema = mongoose.Schema(rawJson);

  // create mongoose model
  var model = mongoose.model(modelName, schema);

  Promise.promisifyAll(model);
  Promise.promisifyAll(model.prototype); // there are functions also exposed on the prototype that we want to promisify

  //aggregate this schema
  schema[modelName] = schema;

  // aggregate this model
  models[modelName] = model;
};

var importCollections = function() {
  if(!collectionsImported) {
    var srcpath = __dirname +'/collections';

    fs.readdirSync(srcpath).filter(function(file) {
      createCollection(file);
    });

    collectionsImported = true;
  }
};

module.exports = {
  importCollections: importCollections,
  schema: schema,
  models: models
};