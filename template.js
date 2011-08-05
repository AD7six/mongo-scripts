/**
 * Template batch script
 *
 * call as mongo db template.js <realbatchscript.js>
 *
 * The strucure of the whole script is:
 *   run
 *     start
 *       processCursors (loop, find <step> rows)
 *         processCursor
 *           beforeCursor
 *           (loop, for each row)
 *             process
 *         afterCursor
 *   finish
 */

options = {
  collection: 'items'
};


/**
 * A template batch class
 * Include the contents of this file before your specific batches
 */
Batch = function(options, run) {
  this.name = 'Template';

  this.options = {
    collection: 'collectionname',
    conditions: {},
    fields: {_id: 1},
    sort: { _id: 1 },
    step: 0,

    logLevel: 3
  };
  for (i in options) {
    this.options[i] = options[i];
  }

  /**
     * process
     *
     * Main process function - What do you want to do to each row returned from the db?
     * this is the row of data from the cursor
     *
     * @return void.
     */
  this.process = function() {
    if (this.name !== 'Template') {
      throw new Error("You need to define the process function for your batch.");
	}
    this.out('processing ' + this.currentRow._id, 4);
    return;

    try {
      db[this.options.collection].update(
          { _id: this.currentRow._id },
          { $set: {
          }
          }
      );
    } catch (err) {
      this.out(err.message, 1);
    }
  }

  /**
     * start
     *
     * What to do at the start of the batch. Aborts everything if it returns false
     *
     * @return bool.
     */
  this.start = function() {
    this.out('Starting ' + this.name + ' batch..', 1);

    try {
      total = db[this.options.collection].count(this.options.conditions);
    } catch (err) {
      this.out(err.message, 1);
      return false;
    }

    this.out('Found ' + total + ' rows in ' + this.options.collection + ' to process', 1);

    if (!total) {
      this.out('Nothing found - aborting', 4);
      return false;
    }

    if (!this.options.step) {
      if (total > 10000) {
        this.options.step = Math.pow(10, total.toString().length - 3);
      } else {
        this.options.step = 100;
      }
      this.out('Step size not defined, processing in slices of ' + this.options.step + ' rows per cursor', 2);
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
  this.finish = function() {
    this.out('Found ' + total + ' rows in ' + this.options.collection + ' to process', 3);
    this.out('All finished', 1);
  }

  /**
     * beforeCursor
     *
     * Called before issuing a find, can abort all further processing by returning false
     *
     * @return bool.
     */
  this.beforeCursor = function() {
    return true;
  }

  /**
     * afterCursor
     *
     * Called after processing a cursor (after processing x rows). Could be used to issue buffered
     * bulk-update statements from the cursor run. Can abort further processing by returning false
     *
     * @param count $count.
     * @return bool.
     */
  this.afterCursor = function(count) {
    this.processed += count;
    this.out(this.processed + ' ' + this.options.collection + ' processed, last id: ' + this.currentRow._id, 3);

    this.options.conditions._id = {'$gt': this.currentRow._id};

    return true;
  }

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
  this.processCursor = function() {
    if (!this.beforeCursor()) {
      this.out('beforeCursor returned false - aborting further processing', 4);
      return false;
    }

    var cursor,
        count = 0;

    try {
      cursor = db[this.options.collection]
            .find(this.options.conditions, this.options.fields)
            .sort(this.options.sort)
            .limit(this.options.step);
    } catch (err) {
      this.out(err.message, 1);
      return false;
    }

    while (cursor.hasNext()) {
      this.currentRow = cursor.next();
      this.process();
      count++;
    }

    return this.afterCursor(count);
  }

  /**
     * processCursors
     *
     * Loop on all cursors until there are none left or one fails.
     *
     * @return void.
     */
  this.processCursors = function() {
    while (this.processed < total || total === true) {
      if (!this.processCursor()) {
        this.out('Last slice failed - aborting further processing in processCursors', 4);
        return;
      }
    }
  }

  /**
     * run
     *
     * Run the start function - if it returns false there's nothing to do or something wrong. stop.
     *
     * Else, call process cursors, and the finish function
     *
     * @return void.
     */
  this.run = function() {
    this.startTime = new Date().getTime();
    this.processed = 0;
    this.total = 0;
    this.currentRow = null;

    if (!this.start()) {
      this.out('start returned false - aborting further processing', 1);
      return false;
    }

    this.processCursors();

    this.finish();
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
  this.out = function(msg, msgLevel) {
    if (msgLevel === undefined) {
      msgLevel = 2;
    }

    if (msgLevel > this.options.logLevel) {
      return;
    }

    var digits = 6,
        time = (new Date().getTime() - this.startTime) / 1000;
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

  if (typeof run === 'undefined' || run === true) {
    this.run();
  }
};
