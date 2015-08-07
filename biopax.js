var he = require('he');

module.exports = (function() {
  'use strict';

  function toJson(str, pathwayMetadata, callback) {
    // Find any named character references (e.g. &copy;) in string. If present,
    // decode them and then re-encode using Unicode values.
    // Reason: Internet Explorer chokes on (some?) named character references in XML.
    var noNamedCharacterReferencesString = str.replace(/&\w+;/g, function(match) {
      return he.encode(he.decode(match));
    });
    str = he.encode(noNamedCharacterReferencesString, {
      // allowUnsafeSymbols means don't encode "<" and ">"
      // (plus some other symbols), but we do encode all other
      // symbols, such as the soft hyphen, which would cause
      // trouble in IE.
      'allowUnsafeSymbols': true
    });

    // TODO convert ontology terms and other data

    var thisJquery;
    var xmlSelection;
    // if we were just using Cheerio, we could select namespace elements like this:
    // xmlSelection('bp\\:PublicationXref')
    // but in my tests with this in Chrome, it appears jQuery doesn't work with that selector
    // so to make this work in both Node.js and the browser,
    // I'm removing the namespace prefixes from element tagNames
    //
    // Update: this selector works in both Chrome and IE (test on FF and node):
    // biopax.find('bp\\:PublicationXref, PublicationXref')
    //
    // namespace prefixes appear to work OK as attribute names.
    if (typeof window === 'undefined') {
      var Cheerio = require('cheerio');
      thisJquery = Cheerio.load(str, {
        normalizeWhitespace: true,
        xmlMode: true,
        decodeEntities: true,
        lowerCaseTags: false
      });
      xmlSelection = thisJquery.root();
    } else {
      thisJquery = $;
      var xmlDoc = $.parseXML(str);
      xmlSelection = $(xmlDoc);
    }

    var jsonBiopax = pathwayMetadata;
    jsonBiopax.entities = [];

    var displayName = 1;
    xmlSelection.find('bp\\:PublicationXref, PublicationXref').each(function() {
      var xmlPublicationXrefSelection = thisJquery(this);
      var publicationXref = {};
      publicationXref.type = 'PublicationXref';
      publicationXref.id = xmlPublicationXrefSelection.attr('rdf:ID') ||
          xmlPublicationXrefSelection.attr('rdf:about');
      var dbNameElements = xmlPublicationXrefSelection.find('bp:db');
      if (!!dbNameElements && dbNameElements.length > 1) {
        dbNameElements = thisJquery(dbNameElements[0]);
      }
      publicationXref.dbName = dbNameElements.text().toLowerCase();

      var dbIdElements = xmlPublicationXrefSelection.find('bp:id');
      if (!!dbIdElements && dbIdElements.length > 1) {
        dbIdElements = thisJquery(dbIdElements[0]);
      }
      publicationXref.dbId = dbIdElements.text();

      var titleElements = xmlPublicationXrefSelection.find('bp:title');
      if (!!titleElements && titleElements.length > 1) {
        titleElements = thisJquery(titleElements[0]);
      }
      publicationXref.title = titleElements.text();

      var sourceElements = xmlPublicationXrefSelection.find('bp:source');
      if (!!sourceElements && sourceElements.length > 1) {
        sourceElements = thisJquery(sourceElements[0]);
      }
      publicationXref.source = sourceElements.text();

      var yearElements = xmlPublicationXrefSelection.find('bp:year');
      if (!!yearElements && yearElements.length > 1) {
        yearElements = thisJquery(yearElements[0]);
      }
      publicationXref.year = yearElements.text();

      var authorElements = xmlPublicationXrefSelection.find('bp:author');
      if (!!authorElements && authorElements.length > 1) {
        authorElements = thisJquery(authorElements[0]);
      }
      publicationXref.author = authorElements.text();

      if (!!publicationXref &&
          !!publicationXref.id &&
          publicationXref.id.indexOf('identifiers') === -1 &&
          (publicationXref.dbName === 'pubmed' || publicationXref.dbName === 'medline') &&
          /^\d+$/g.test(publicationXref.dbId)) {
        publicationXref.deprecatedId = publicationXref.id;
        publicationXref.id = 'http://identifiers.org/pubmed/' + publicationXref.dbId;
      }

      publicationXref.displayName = displayName;
      displayName += 1;
      jsonBiopax.entities.push(publicationXref);
    });
    callback(null, jsonBiopax);
  }

  return {
    toJson: toJson
  };
}());
