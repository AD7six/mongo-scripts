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
 * By faster here are some numbers from copying a random collection with a million rows:
 * 	running this batch, step size 100, individual inserts, duration: 1147s
 * 	running this batch, step size 100, batch inserts, duration: 1147s
 * 	using mongo export piped to mongoimport: 300s
 *
 * However, it demonstrates how to write a script which optionally  buffers db activity and "commits" once per slice
 * instead of one row at a time.
 *
 * Define the (source) collection to copy, the 'to' collection - and run
 * Can either be run a row at a time - or using batchInserts
 *
 */

var to = "destination",
	collection = "source",
	conditions ={},
	fields = {},
	sort = { _id : 1 },
	step = 0,
	batchInserts = false,
	stack = [],

	/* Lower means less console output */
	logLevel = 3,

	/* Internal variables */
	processed = 0, total, Row;

/**
 * process
 *
 * Main process function - What do you want to do to each row returned from the db?
 * this is the row of data from the cursor
 *
 * @return void
 */
function process() {
	out("processing " + this.name || this.title || this._id, 4);

	if (batchInserts) {
		stack.push(this);
	} else {
		try{
			db[to].insert(this);
		} catch (err) {
			out(err.description, 1);
		}
	}
}

/**
 * start
 *
 * What to do at the start of the batch. Aborts everything if it returns false
 * To create a script which runs without a limit - set the total to true. In this
 * case the script then runs until processCursor returns false
 *
 * @return bool
 */
function start() {
	try{
		total = db[collection].count(conditions);
	} catch (err) {
		out(err.description, 1);
		return false;
	}

	out("Found " + total + " rows in " + collection + " to process", 1);

	if (!total) {
		out("Nothing found - aborting", 3);
		return false;
	}

	if (!step) {
		if (batchInserts) {
			step = 100;
		} else {
			if (total > 10000) {
				step = Math.pow(10, total.toString().length - 3);
			} else {
				step = 100;
			}
		}
		out("Step size not defined, processing in slices of " + step + " rows per cursor", 2);
	}

	try{
		db[to].drop();
	} catch (err) {
		out(err.description, 1);
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
	out("Found " + total + " rows in " + collection + " to process", 3);
	out("All finished", 1);
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
	if (batchInserts) {
		try{
			db[to].insert(stack);
		} catch (err) {
			out(err.description, 1);
		}
		stack = [];
	}

	processed += count;
	out(processed + " " + collection + " processed, last id: " + LastRow._id, 3);

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
		out("beforeCursor returned false - aborting further processing", 4);
		return false;
	}

	var cursor,
		count = 0;

	try {
		cursor = db[collection].find( conditions, fields ).sort( sort ).limit( step );
	} catch (err) {
		out(err.description, 1);
		return false;
	}

	while (cursor.hasNext()) {
		Row = cursor.next();
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
	while (processed < total || total === true) {
		if (!processCursor()) {
			out("Last slice failed - aborting further processing in processCursors", 4);
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
	startTime = new Date().getTime();

	if (!start())  {
		out("start returned false - aborting further processing", 1);
		return false;
	}

	processCursors();

	finish();
}

/**
 * out - wrapper for printing output
 *
 * If the msgLevel is greater than the configured logLevel - do nothing
 * Otherwise, prefix with time since the script started
 *
 * @param msg
 * @param msgLevel
 * @return void
 */
function out(msg, msgLevel) {
	if (msgLevel === undefined) {
		msgLevel = 2;
	}

	if (msgLevel > logLevel) {
		return;
	}

	var digits = 6,
		time = (new Date().getTime() - startTime) / 1000;
	if (time > 1000) {
		digits = 9;
	}

	function pad(n, len) {
		s = n.toString();
		if (s.length < len) {
			s = ('          ' + s).slice(-len);
		}
		return s;
	}

	print('[' + pad(time.toFixed(2), digits) + 's] ' + msg);
}

/**
 *  Launch main function
 */
mainLoop();
