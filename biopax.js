'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function($, pathwayMetadata, callback) {
    var jsonBiopax = {};
    jsonBiopax.xref = [];

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
      jsonBiopax.xref.push(publicationXref);
    });
    callback(null, jsonBiopax);
  }
};
