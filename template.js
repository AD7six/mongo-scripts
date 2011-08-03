/**
 * Standard batch script
 *
 * Define the collection to run on, the general conditions, and the process function
 * to call for each row returned from the db
 */

var collection = "collectionname",
	conditions ={},
	step = 100,

	/* Internal variables */
	processed = 0, total, cCursor, Row;

/**
 * process
 *
 * Main process function - What do you want to do to each row returned from the db?
 * this is the row of data from the cursor
 *
 * @return void
 */
function process() {
	print( "updating " + this.name || this.title || this._id);
	db[collection].update(
		{ _id: this._id },
		{ $set: {
			}
		}
	);
}

/**
 * start
 *
 * What to do at the start of the batch. Aborts everything if it returns false
 *
 * @return bool
 */
function start() {
	total = db[collection].count(conditions);

	print("Found " + total + " rows in " + collection + " to process");

	if (!total) {
		print("Nothing found - aborting");
		return false;
	}

	return true;
};

/**
 * finish
 *
 * Called at the end of the batch process
 *
 * @return void
 */
function finish() {
	print("Found " + total + " rows in " + collection + " to process");
	print("All finished");
};

/**
 * beforeCursor
 *
 * Called before issuing a find, can abort all further processing by returning false
 *
 * @param LastRow $LastRow
 * @return bool
 */
function beforeCursor(LastRow) {
	return true;
};

/**
 * afterCursor
 *
 * Called after processing a cursor (after processing x rows). Could be used to issue buffered
 * bulk-update statements from the cursor run. Can abort further processing by returning false
 *
 * @param count $count
 * @param LastRow $LastRow
 * @return bool
 */
function afterCursor(count, LastRow) {
	processed += count;
	print(processed + " " + collection + " processed, last id: " + LastRow._id);

	conditions._id = {"$gt": LastRow._id};

	return true;
};

/* Shouldn't need to edit below this line */

/**
 * processCursor
 *
 * Runs a query using the collection, conditions and step defined at the top of the script
 * if beforeCursor returns false - no query is performed and the whole batch process is halted
 * Otherwise, it loops on the cursor passing each row to the process function. The last
 * step for each cursor is to call afterCursor - which can also abort further processing
 * by returning false
 *
 * @return bool
 */
function processCursor() {
	if (!beforeCursor(Row)) {
		print("beforeCursor returned false - aborting further processing");
		return false;
	}

	var cCursor = db[collection].find( conditions ).sort( { _id : 1 } ).limit(step),
		count = 0;

	while (cCursor.hasNext()) {
		Row = cCursor.next();
		process.call(Row);
		count++;
	}

	return afterCursor(count, Row);
}

/**
 * processCursors
 *
 * Loop on all cursors until there are none left or one fails.
 *
 * @return void
 */
function processCursors() {
	while (processed < total) {
		if (!processCursor()) {
			print("Last slice failed - aborting further processing in processCursors");
			return;
		}
	}
}

/**
 * mainLoop
 *
 * Run the start function - if it returns false there's nothing to do or something wrong. stop.
 *
 * Else, call process cursors, and the finish function
 *
 * @return void
 */
function mainLoop() {
	if (!start())  {
		print("start returned false - aborting further processing");
		return false;
	}

	processCursors();

	finish();
}

/**
 *  Launch main function
 */
mainLoop();
