'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function(args, callback) {
    var xmlSelection = args.data;
    var jsonld = args.jsonld;
    var xmlBiopaxPubs = xmlSelection.find('PublicationXref');
    var jsonBiopax = {};
    jsonBiopax.publicationXref = [];
    xmlBiopaxPubs.each(function() {
      var publicationXref = {};
      publicationXref.id = $(this).attr('rdf:ID').toString();
      jsonBiopax.publicationXref.push(publicationXref);
    });
    callback(null, jsonBiopax);
  }
};
