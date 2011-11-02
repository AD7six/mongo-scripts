/**
 * What are all the keys used in the collection "things" ? and how many times is each key used?
 *
 * Adapated from the example in MongoDB the definitive guide
 */

collection = "things";

mr = db.runCommand({
	"mapreduce" : collection,
	"map" : function() {
		var key;
		
		for (key in this) { 
			emit(key, {count: 1});
		}
	},
   "out": {replace: collection + "KeysDetailed"},
   "reduce" : function(key, emits) { 
	   var key, total = 0;

	   for (i in emits) {
		   total = total + emits[i].count;
	   }
	   return {count: total};
   }
});

print();
print(collection + " keys:");

db[mr.result]
	.find()
	.forEach(function(row) {
		prefix = "\t";
		print(prefix + row._id + ': ' + row.value.count);
	} );
