/**
 * What are all the keys used in the collection "things" ?
 *
 * Adapted from http://stackoverflow.com/questions/2298870/mongodb-get-names-of-all-keys-in-collection
 */
collection = "things";

mr = db.runCommand({
	"mapreduce" : collection,
	"map" : function() {
		var key;

		for (key in this) { 
			emit(key, null);
		}
	},
   "out": {replace: collection + "Keys"},
   "reduce" : function(key, stuff) { 
	   return null;
   }
});

print();
print(collection + " keys:");

db[mr.result]
	.find()
	.forEach(function(row) {
		print(row._id);
	} );
