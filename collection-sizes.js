function pad(str, length, dir) {
    if (!dir) {
        dir = "left";
    }

    if (dir === "left") {
        str = "" + str;
        while (str.length < length) {
            str = " " + str;
        }
        return str;
    }

    while (str.length < length) {
        str = str + " ";
    }
    return str;
}

var collections = db.getCollectionNames();

var total = 0;
for(var i in collections) {
    if (typeof(db[collections[i]].totalSize) !== "function") {
        continue;
    }
    var size = db[collections[i]].totalSize();
    print(pad(collections[i], 30, "right") + pad(size, 20, "left") + " bytes");
    total += size;
}
print("-------------");
print(pad("Total:", 30, "right") + pad(total, 20, "left") + " bytes");
