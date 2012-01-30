/**
 * loop on all collections and output their counts and size in bytes.
 *
 * Prints in a tabular format
 */

var i, size, count,
	collections = db.getCollectionNames();
	totalCount = 0,
	totalSize = 0,
	totalUnused = 0;

print(renderLine('wrap'));
print(renderLine('header', db + " collections", "Count", "Unused (Bytes)", "Size (Bytes)"));
print(renderLine('divider'));

for(i in collections) {
	if (typeof(db[collections[i]].totalSize) !== "function") {
		continue;
	}
	count = db[collections[i]].count();
	size = db[collections[i]].totalSize();
	unused = db[collections[i]].storageSize() - db[collections[i]].dataSize();

	print(renderLine('data', collections[i], count, unused, size));

	totalCount += count;
	totalSize += size;
	totalUnused += unused;
}

print(renderLine('divider'));
print(renderLine('data', 'Totals:', totalCount, totalUnused, totalSize));
print(renderLine('wrap'));
percent = Math.round(totalUnused * 100 / totalSize);
print(percent + '% unused space');

/**
 * A helper function to Render a line of the table
 *
 * @param type $type data, divider or wrap
 * @param one $one
 * @param two $two
 * @param three $three
 *
 * @return a string
 */
function renderLine(type, one, two, three, four) {
	var line = '',
		widths = [36, 14, 20, 20],
		padding = ['right', 'left', 'left', 'left'];

	if (type === 'divider') {
		return renderLine('data', '', '', '', '').replace(/ /g, '-');
	}
	if (type === 'wrap') {
		return renderLine('data', '', '', '', '').replace(/./g, '-');
	}

	if (type === 'header') {
		padding = ['center', 'center', 'center', 'center'];
	}
	return '| ' + pad(one, widths[0], padding[0]) + ' | ' + pad(two, widths[1], padding[1]) + ' | ' + pad(three, widths[2], padding[2]) + ' | ' + pad(four, widths[3], padding[3]) + ' |';
}

/**
 * Pad the input string to the specified length
 *
 * dir defaults to left
 * chr defaults to a space
 *
 * @param string str
 * @param int length
 * @param string dir (left, right or center)
 * @param string chr
 * @return string
 * @access public
 */
function pad(str, length, dir, chr) {
	if (!dir) {
		dir = "left";
	}

	if (!chr) {
		chr = " ";
	}

	str = "" + str;

	if (dir === "left") {
		while (str.length < length) {
			str = chr + str;
		}
		return str;
	}

	if (dir === "center") {
		var i = 0;
		while (str.length < length) {
			if (i % 2) {
				str = str + chr;
			} else {
				str = chr + str;
			}
			i++;
		}
		return str;
	}

	while (str.length < length) {
		str = str + chr;
	}
	return str;
}
