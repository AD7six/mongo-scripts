/**
 * Standard batch script
 *
 * Define the collection to run on, the general conditions, and in the middle of the loop what
 * it is supposed to do
 */

var collection = "collectionname",
	conditions ={},

	processed = 0,
	step = 10,
	total = db[collection].count(conditions),

	cCursor, Row;

print("Found " + total + " " + collection + " to process");
while (processed < total) {
	cCursor = db[collection].find( conditions ).sort( { _id : 1 } ).limit(step);
	while (cCursor.hasNext()) {
		Row = cCursor.next();

		print( "updating " + Row._id);
		db[collection].update(
			{ _id: Row._id },
			{ $set: {
				}
			}
		);
	}
	processed += step;
	print(processed + " " + collection + " processed");

	conditions._id = {"$gt": Row._id};
}
print("finished");
