/**
 * Copy one collection to another
 *
 * See http://www.mongodb.org/display/DOCS/Developer+FAQ#DeveloperFAQ-HowdoIcopyallobjectsfromonedatabasecollectiontoanother
 * Allegedly, this is the only way to do it in mongodb. Implemented as a batch script
 *
 * This is a somewhat accademic script - don't use it. if you need to copy one collection to another the fastest way
 * is to do:
 * 	 mongoexport -d db -c sourcecollection | mongoimport -d db -c targetcollection --drop
 *
 * By faster here are some numbers from copying a random collection with a million rows (2GB of data):
 * 	running this batch, step size 100, individual inserts, duration: 1147s
 * 	running this batch, step size 100, batch inserts, duration: 1147s
 * 	running a one line db.source.find().forEach(function(x) { db.target.insert(x); }): 1080s
 * 	using mongo export piped to mongoimport: 300s
 *
 * However, it demonstrates how to write a script which optionally  buffers db activity and "commits" once per slice
 * instead of one row at a time.
 *
 * Define the (source) collection to copy, the 'to' collection - and run
 * Can either be run a row at a time - or using batchInserts
 *
 */

/* @IMPORTANT include source of template.js here - exclude the last line - `new Batch(options);` */

var options = {
	to: "collectionname",
	collection: "items",
	batchInserts: true
};

CopyCollection = new Batch(options, false);

/**
 * process
 *
 * Main process function - What do you want to do to each row returned from the db?
 * this is the row of data from the cursor
 *
 * @return void
 */
CopyCollection.process = function process() {
    this.out('processing ' + this.currentRow._id, 4);

	if (this.options.batchInserts) {
		this.stack.push(this.currentRow);
	} else {
		try{
			db[this.options.to].insert(this.currentRow);
		} catch (err) {
			out(err.description, 1);
		}
	}
};

/**
 * start
 *
 * Run the standard start function, then drop the destination collection
 *
 * @return bool
 */
CopyCollection.originalStart = CopyCollection.start;
CopyCollection.start = function() {
	if (!this.originalStart()) {
		return false;
	}

    this.out('Dropping ' + this.options.to + ' collection', 1);
	try{
		db[this.options.to].drop();
	} catch (err) {
		out(err.description, 1);
	}

	this.stack = [];

	return true;
};

/**
 * afterCursor
 *
 * Called after processing a cursor (after processing x rows). Could be used to issue buffered
 * bulk-update statements from the cursor run. Can abort further processing by returning false
 *
 * @param count $count
 * @return bool
 */
CopyCollection.originalAfterCursor = CopyCollection.afterCursor;
CopyCollection.afterCursor = function afterCursor(count) {
	if (this.options.batchInserts) {
    	this.out('Bulk inserting ' + this.stack.length + ' rows into ' + this.options.to, 4);
		try{
			db[this.options.to].insert(this.stack);
		} catch (err) {
			out(err.description, 1);
		}
		this.stack = [];
	}

	return this.originalAfterCursor(count);
};

CopyCollection.run();
