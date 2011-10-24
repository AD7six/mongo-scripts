/**
 * What are all the keys used in the collection "things" ?
 *
 * Taken from http://stackoverflow.com/questions/2298870/mongodb-get-names-of-all-keys-in-collection
 */

mr = db.runCommand({
	"mapreduce" : "things",
	"map" : function() {
		for (var key in this) { 
			emit(key, null);
		}
	},
   "out": {replace: "keys"},
   "reduce" : function(key, stuff) { 
	   return null;
   }
});

print(db[mr.result].distinct("_id"));
