/**
 * Correct geo data
 *
 * call as `mongo db template.js thisfile.js`
 *
 * If you've accidentally saved your geo data as not-floats, this is the script for you
 */

options = {
  collection: 'places',
  fields: {geo: true},
  /**
 * Type 2 is a string
 * http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24type
 */
  conditions: { 'geo.longitude' : {$type: 2} }
};

CorrectGeo = new Batch(options, false);

CorrectGeo.process = function() {
  this.out('processing ' + this.currentRow._id, 4);
  try {
    db[this.options.collection].update(
        { _id: this.currentRow._id },
        { $set: {
          geo: {
            'longitude' : parseFloat(this.currentRow.geo.longitude),
            'latitude' : parseFloat(this.currentRow.geo.latitude)
          }
        }
        }
    );
  } catch (err) {
    this.out(err.message, 1);
  }
};

CorrectGeo.run();
