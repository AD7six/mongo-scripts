/**
 * Standard batch script
 * Define the collection to run on, the general conditions, and in the middle of the loop what
 * it's supposed to do
 */

var collection = 'collectionname';
var conditions ={};

var processed = 0;
var step = 10;
var total = db[collection].count(conditions);

print('Found ' + total + ' ' + collection + ' to process');
while (processed < total) {
	var cCursor = db[collection].find( conditions ).sort( { _id : 1 } ).limit(step);
	while (cCursor.hasNext()) {
		Row = cCursor.next();

		print( "updating " + Row._id);
		db[collection].update(
			{ _id: Row._id },
			{ $set: {
				}
			}
		);

		conditions['_id'] = { $gt: Row._id };
	}
	processed += step;
	print(processed + " " + collection + " processed");

	conditions._id = {"$gt": Row._id};
}
print("finished");