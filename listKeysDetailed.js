/**
 * What are all the keys used in the collection "things" ? and how many times is each key used?
 * Will recurse on all keys in a collection, is a lot slower than listKeys.js 
 *
 * Adapated from the example in MongoDB the definitive guide
 */

collection = "things";

db.system.js.save({
	_id: "emitr",
	value: function(obj, prefix) {
		var key;

		for (key in obj) { 
			if (!obj.hasOwnProperty(key) || typeof obj[key] === 'function') {
				continue;
			}

			if (typeof obj[key] === 'object') {
				if (typeof key === 'number' || key.match(/^\d+$/)) {
					emitr(obj[key], prefix);
					continue;
				} else {
					emitr(obj[key], prefix + key + '.');
					continue;
				}
			}

			if (typeof key === 'number' || key.match(/^\d+$/) || key === 'floatApprox') {
				emit(prefix.replace(/\.$/, ''), {count: 1});
			} else {
				emit(prefix + key, {count: 1});
			}

		}
	}
});

mr = db.runCommand({
	"mapreduce" : collection,
	"map" : function() {
		emitr(this, '');
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
