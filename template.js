/**
 * Standard batch script
 *
 * Define the collection to run on, the general conditions, and the process function
 * to call for each row returned from the db
 *
 * The strucure of the whole script is:
 *   mainLoop
 *     start
 *       processCursors (loop, find <step> rows)
 *         processCursor
 *           beforeCursor
 *           (loop, for each row)
 *             process
 *         afterCursor
 *   finish
 */

var collection = 'collectionname',
    conditions = {},
    fields = {_id: 1},
    sort = { _id: 1 },
    step = 0,

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
 * @return void.
 */
function process() {
  out('processing ' + this._id, 4);
  try {
    db[collection].update(
        { _id: this._id },
        { $set: {
        }
        }
    );
  } catch (err) {
    out(err.description, 1);
  }
}


/**
 * start
 *
 * What to do at the start of the batch. Aborts everything if it returns false
 *
 * @return bool.
 */
function start() {
  try {
    total = db[collection].count(conditions);
  } catch (err) {
    out(err.description, 1);
    return false;
  }

  out('Found ' + total + ' rows in ' + collection + ' to process', 1);

  if (!total) {
    out('Nothing found - aborting', 4);
    return false;
  }

  if (!step) {
    if (total > 10000) {
      step = Math.pow(10, total.toString().length - 3);
    } else {
      step = 100;
    }
    out('Step size not defined, processing in slices of ' + step + ' rows per cursor', 2);
  }

  return true;
}


/**
 * finish
 *
 * Called at the end of the batch process
 *
 * @return void.
 */
function finish() {
  out('Found ' + total + ' rows in ' + collection + ' to process', 3);
  out('All finished', 1);
}


/**
 * beforeCursor
 *
 * Called before issuing a find, can abort all further processing by returning false
 *
 * @param LastRow $LastRow.
 * @return bool.
 */
function beforeCursor(LastRow) {
  return true;
}


/**
 * afterCursor
 *
 * Called after processing a cursor (after processing x rows). Could be used to issue buffered
 * bulk-update statements from the cursor run. Can abort further processing by returning false
 *
 * @param count $count.
 * @param LastRow $LastRow.
 * @return bool.
 */
function afterCursor(count, LastRow) {
  processed += count;
  out(processed + ' ' + collection + ' processed, last id: ' + LastRow._id, 3);

  conditions._id = {'$gt': LastRow._id};

  return true;
}

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
 * @return bool.
 */
function processCursor() {
  if (!beforeCursor(Row)) {
    out('beforeCursor returned false - aborting further processing', 4);
    return false;
  }

  var cursor,
      count = 0;

  try {
    cursor = db[collection].find(conditions, fields).sort(sort).limit(step);
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
 * @return void.
 */
function processCursors() {
  while (processed < total || total === true) {
    if (!processCursor()) {
      out('Last slice failed - aborting further processing in processCursors', 4);
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
 * @return void.
 */
function mainLoop() {
  startTime = new Date().getTime();

  if (!start()) {
    out('start returned false - aborting further processing', 1);
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
 * @return void.
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
