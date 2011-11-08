/**
 * Prepare Batch Slices script
 *
 * call as mongo db template.js prepareBatcSlices.js
 *
 * This script adds a pseudo-random 2 character key to each row in the collection. This key can
 * then be used to divide the total work into arbitrary, but approximiately equal in size, slices
 * thereby potentially permitting th parallelization of any process which is looping on the data
 */

/**
 * Runtime options, which colleciction to run on
 */
var options = {
  collection: 'things'
};

PrepareBatchSlices = new Batch(options, false);
PrepareBatchSlices.name = 'PrepareBatchSlices';
PrepareBatchSlices.found = 0;

/**
 * process
 *
 * set the batchSlice key for each row to the last 2 characters of the _id. This allows for the 
 * possibility to include batchSlice in the 'global' conditions for any process and thereby
 * permitting the parallization of processes which would otherwise run in a single thread.
 *
 * @return void.
 */
PrepareBatchSlices.process = function() {
  var slice;
 
  this.out('processing ' + this.currentRow._id, 4);

  slice = ('  ' + this.currentRow._id).substr(-2, 2);
  try {
    db[this.options.collection].update(
        { _id: this.currentRow._id },
        { $set: {
          batchSlice: slice
        }
        }
    );
  } catch (err) {
    this.out(err.message, 1);
  }
};

/**
 * finish
 *
 * When we're finished - make sure there is an index on batchSlice
 */
PrepareBatchSlices.originalFinish = PrepareBatchSlices.finish;
PrepareBatchSlices.finish = function finish() {
  db[this.options.collection].ensureIndex({batchSlice: 1});

  return this.originalFinish();
};

PrepareBatchSlices.run();
