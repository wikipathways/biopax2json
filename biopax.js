'use strict';
module.exports = {
  // TODO get ontology terms and other data

  toJson: function(str, pathwayMetadata, callback) {
    var thisJquery;
    var xmlSelection;
    // if we were just using Cheerio, we could select namespace elements like this:
    // xmlSelection('bp\\:PublicationXref')
    // but in my tests with this in Chrome, it appears jQuery doesn't work with that selector
    // so to make this work in both Node.js and the browser, I'm removing the namespace prefixes from element tagNames
    // namespace prefixes appear to work OK as attribute names.
    var plainElementTagsStr = str.replace(/bp\:/g, '').replace(/rdf\:id/g, 'rdf:ID');
    if (typeof window === 'undefined') {
      var Cheerio = require('cheerio');
      thisJquery = Cheerio.load(plainElementTagsStr, {
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: true,
        lowerCaseTags: false
      });
      xmlSelection = thisJquery.root();
    } else {
      thisJquery = $;
      var xmlDoc = $.parseXML(plainElementTagsStr);
      xmlSelection = $(xmlDoc);
    }

    var jsonBiopax = pathwayMetadata;
    jsonBiopax.entities = [];

    var displayName = 1;
    xmlSelection.find('PublicationXref').each(function() {
      var xmlPublicationXrefSelection = thisJquery( this );
      var publicationXref = {};
      publicationXref.type = 'PublicationXref';
      publicationXref.id = xmlPublicationXrefSelection.attr('rdf:ID') || xmlPublicationXrefSelection.attr('rdf:about');
      var dbNameElements = xmlPublicationXrefSelection.find('db');
      if (!!dbNameElements && dbNameElements.length > 1) {
        dbNameElements = thisJquery(dbNameElements[0]);
      }
      publicationXref.dbName = dbNameElements.text().toLowerCase();

      var dbIdElements = xmlPublicationXrefSelection.find('id');
      if (!!dbIdElements && dbIdElements.length > 1) {
        dbIdElements = thisJquery(dbIdElements[0]);
      }
      publicationXref.dbId = dbIdElements.text();

      var titleElements = xmlPublicationXrefSelection.find('title');
      if (!!titleElements && titleElements.length > 1) {
        titleElements = thisJquery(titleElements[0]);
      }
      publicationXref.title = titleElements.text();

      var sourceElements = xmlPublicationXrefSelection.find('source');
      if (!!sourceElements && sourceElements.length > 1) {
        sourceElements = thisJquery(sourceElements[0]);
      }
      publicationXref.source = sourceElements.text();

      var yearElements = xmlPublicationXrefSelection.find('year');
      if (!!yearElements && yearElements.length > 1) {
        yearElements = thisJquery(yearElements[0]);
      }
      publicationXref.year = yearElements.text();

      var authorElements = xmlPublicationXrefSelection.find('author');
      if (!!authorElements && authorElements.length > 1) {
        authorElements = thisJquery(authorElements[0]);
      }
      publicationXref.author = authorElements.text();

      if (!!publicationXref && !!publicationXref.id && publicationXref.id.indexOf('identifiers') === -1 && (publicationXref.dbName === 'pubmed' || publicationXref.dbName === 'medline') && /^\d+$/g.test(publicationXref.dbId)) {
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
