var Cheerio = require('cheerio');
'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function(str, pathwayMetadata, callback) {
    $ = Cheerio.load(str, {
      normalizeWhitespace: true,
    xmlMode: true,
    decodeEntities: true,
    lowerCaseTags: false
    });

    var jsonBiopax = pathwayMetadata;
    jsonBiopax.entities = [];

    var displayId = 1;
    $('bp\\:PublicationXref').each(function() {
      var xmlPublicationXrefSelection = $( this );
      console.log('xmlPublicationXrefSelection');
      console.log(xmlPublicationXrefSelection);
      var publicationXref = {};
      publicationXref.type = 'PublicationXref';
      publicationXref.id = xmlPublicationXrefSelection.attr('rdf:ID') || xmlPublicationXrefSelection.attr('rdf:about');
      var dbNameElement = xmlPublicationXrefSelection.find('bp\\:db')[0];
      publicationXref.dbName = $( dbNameElement ).text().toLowerCase();
      var dbIdElement = xmlPublicationXrefSelection.find('bp\\:id')[0];
      publicationXref.dbId = $( dbIdElement ).text();
      if (publicationXref.id.indexOf('identifiers') === -1 && (publicationXref.dbName.toLowerCase() === 'pubmed' || publicationXref.dbName.toLowerCase() === 'medline') && /^\d+$/g.test(publicationXref.dbId)) {
        publicationXref.deprecatedId = publicationXref.id;
        publicationXref.id = 'http://identifiers.org/pubmed/' + publicationXref.dbId;
      }
      publicationXref.displayId = displayId;
      displayId += 1;
      jsonBiopax.entities.push(publicationXref);
    });
    callback(null, jsonBiopax);
  }
};
