'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function(str, pathwayMetadata, callback) {


    var xmlSelection;
    if (typeof window === 'undefined') {
      var Cheerio = require('cheerio');
      xmlSelection = Cheerio.load(str, {
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: true,
        lowerCaseTags: false
      });
    } else {
      var xmlDoc = $.parseXML( str );
      xmlSelection = $( xmlDoc.documentElement );
      //xmlSelection = $( xmlDoc );
    }

    var jsonBiopax = pathwayMetadata;
    jsonBiopax.entities = [];

    var displayName = 1;
    xmlSelection('bp\\:PublicationXref').each(function() {
      var xmlPublicationXrefSelection = xmlSelection( this );
      var publicationXref = {};
      publicationXref.type = 'PublicationXref';
      publicationXref.id = xmlPublicationXrefSelection.attr('rdf:ID') || xmlPublicationXrefSelection.attr('rdf:about');
      var dbNameElement = xmlPublicationXrefSelection.find('bp\\:db')[0];
      publicationXref.dbName = xmlSelection( dbNameElement ).text().toLowerCase();
      var dbIdElement = xmlPublicationXrefSelection.find('bp\\:id')[0];
      publicationXref.dbId = xmlSelection( dbIdElement ).text();
      if (publicationXref.id.indexOf('identifiers') === -1 && (publicationXref.dbName.toLowerCase() === 'pubmed' || publicationXref.dbName.toLowerCase() === 'medline') && /^\d+$/g.test(publicationXref.dbId)) {
        publicationXref.deprecatedId = publicationXref.id;
        publicationXref.id = 'http://identifiers.org/pubmed/' + publicationXref.dbId;
      }
      publicationXref.displayName = displayName;
      displayName += 1;
      jsonBiopax.entities.push(publicationXref);
    });
    callback(null, jsonBiopax);
  }
};
