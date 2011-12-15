/**
 * loop on all collections and output their counts and size in bytes.
 *
 * Prints in a tabular format
 */
print(pad("-", 72, "", "-"));
print(pad(db + " collections", 30, "center") + '|' + pad("Count", 20, "center") + '|' + pad("Size (Bytes)", 20, "center"));
print(pad("-", 30, "", "-") + '|' + pad("-", 20, "", "-") + '|' + pad("-", 20, "", "-"));

var i, size, count,
	collections = db.getCollectionNames();
	totalCount = 0,
	totalSize = 0;
for(i in collections) {
	if (typeof(db[collections[i]].totalSize) !== "function") {
		continue;
	}
	count = db[collections[i]].count();
	size = db[collections[i]].totalSize();

	print(pad(collections[i], 30, "right") + '|' + pad(count, 20, "left") + '|' + pad(size, 20, "left"));
	totalCount += count;
	totalSize += size;
}

print(pad("-", 30, "", "-") + '|' + pad("-", 20, "", "-") + '|' + pad("-", 20, "", "-"));
print(pad("Total:", 30, "right") + '|' + pad(totalCount, 20, "left") + '|' + pad(totalSize, 20, "left"));
print(pad("-", 72, "", "-"));

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
