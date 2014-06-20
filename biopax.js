'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function(str, pathwayMetadata, callback) {


    var xmlSelection;
    // if we were just using Cheerio, we could select namespace elements like this:
    // xmlSelection('bp\\:PublicationXref')
    // but in my tests with this in Chrome, it appears jQuery doesn't work with that selector
    // so to make this work in both Node.js and the browser, I'm removing the namespace prefixes from element tagNames
    // namespace prefixes appear to work OK as attribute names.
    var denamespacedStr = str.replace(/bp\:/g, '');
    var $ = $ || null;
    if (!$) {
      // Cheerio allows us to use jQuery selectors in Node.js
    //if (typeof window === 'undefined') {
      var Cheerio = require('cheerio');
      $ = Cheerio.load(denamespacedStr, {
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: true,
        lowerCaseTags: false
      });
      xmlSelection = $.root();
    } else {
      var xmlDoc = $.parseXML(str);
      xmlSelection = $(xmlDoc);
    }

    var jsonBiopax = pathwayMetadata;
    jsonBiopax.entities = [];

    var displayName = 1;
    xmlSelection.find('PublicationXref').each(function() {
      var xmlPublicationXrefSelection = $( this );
      var publicationXref = {};
      publicationXref.type = 'PublicationXref';
      publicationXref.id = xmlPublicationXrefSelection.attr('rdf:ID') || xmlPublicationXrefSelection.attr('rdf:about');
      publicationXref.dbName = xmlPublicationXrefSelection.find('db').text().toLowerCase();
      publicationXref.dbId = xmlPublicationXrefSelection.find('id').text();
      // convert the id to an identifiers.org URI, if it's a pubmed reference and not already an identifiers.org URI
      if (publicationXref.id.indexOf('identifiers') === -1 && (publicationXref.dbName === 'pubmed' || publicationXref.dbName === 'medline') && /^\d+$/g.test(publicationXref.dbId)) {
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
