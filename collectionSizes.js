/**
 * loop on all collections and output their counts and size in bytes.
 *
 * Prints in a tabular format
 */

var i, size, count,
	collections = db.getCollectionNames();
	totalCount = 0,
	totalSize = 0;

print(renderLine('wrap'));
print(renderLine('header', db + " collections", "Count", "Size (Bytes)"));
print(renderLine('divider'));

for(i in collections) {
	if (typeof(db[collections[i]].totalSize) !== "function") {
		continue;
	}
	count = db[collections[i]].count();
	size = db[collections[i]].totalSize();

	print(renderLine('data', collections[i], count, size));

	totalCount += count;
	totalSize += size;
}

print(renderLine('divider'));
print(renderLine('data', 'Totals:', totalCount, totalSize));
print(renderLine('wrap'));

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
function renderLine(type, one, two, three) {
	var line = '';

	if (type === 'data') {
		line = '| ' + pad(one, 36, "right") + ' | ' + pad(two, 14, "left") + ' | ' + pad(three, 20, "left") + ' |';
	} else if (type === 'header') {
		line = '| ' + pad(one, 36, "center") + ' | ' + pad(two, 14, "center") + ' | ' + pad(three, 20, "center") + ' |';
	} else if (type === 'divider') {
		line = renderLine('data', '', '', '').replace(/ /g, '-');
	} else if (type === 'wrap') {
		line = renderLine('data', '', '', '').replace(/./g, '-');
	}

	return line;
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
