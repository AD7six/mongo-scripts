/**
 * loop on all collections and output their size in bytes.
 *
 * Prints in a tabular format
 */
print(pad("-", 51, "", "-"));
print(pad(db + " collections", 30, "center") + '|' + pad("Size (Bytes)", 20, "center"));
print(pad("-", 30, "", "-") + '|' + pad("-", 20, "", "-"));

var collections = db.getCollectionNames();
var total = 0;
for(var i in collections) {
    if (typeof(db[collections[i]].totalSize) !== "function") {
        continue;
    }
    var size = db[collections[i]].totalSize();
    print(pad(collections[i], 30, "right") + '|' + pad(size, 20, "left"));
    total += size;
}

print(pad("-", 30, "", "-") + '|' + pad("-", 20, "", "-"));
print(pad("Total:", 30, "right") + '|' + pad(total, 20, "left"));
print(pad("-", 51, "", "-"));

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

    if (dir === "left") {
        str = "" + str;
        while (str.length < length) {
            str = chr + str;
        }
        return str;
    }

    if (dir === "center") {
        str = "" + str;
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