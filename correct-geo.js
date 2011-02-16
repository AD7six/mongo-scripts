/**
 * Correct geo data
 *
 * If you've accidentally saved your geo data as not-floats, this is the script for you
 */

var collection = "collectionname";

/**
 * Type 2 is a string
 * http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24type
 */
var conditions ={ "geo.longitude" : {$type: 2} };

var processed = 0;
var step = 10;
var total = db[collection].count(conditions);

print("Found " + total + " " + collection + " to process");
while (processed < total) {
	var cCursor = db[collection].find( conditions ).sort( { _id : 1 } ).limit(step);
	while (cCursor.hasNext()) {
		Row = cCursor.next();

		print( "updating " + Row._id);
		db[collection].update(
			{ _id: Row._id },
			{ $set: {
				geo = {
						"longitude" : parseFloat(Row.geo.longitude),
						"latitude" : parseFloat(Row.geo.latitude)
					}
				}
			}
		);
	}
	processed += step;
	print(processed + " " + collection + " processed");

	conditions._id = {"$gt": Row._id};
}
print("finished");