function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function array_contain (arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] == obj) {
            return true;
        }
    }
    return false;
}