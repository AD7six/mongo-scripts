/**
 * An example script looping on collections in a db.
 *
 * Delete all collections which start with log_ or contain the string _temp_ in their name
 */

var collections = db.getCollectionNames();

for(var i in collections) {
	if (collections[i].match(/(^log_|_temp_)/)) {
		print('Dropping ' + collections[i]);
		db[collections[i]].drop();
	}
}