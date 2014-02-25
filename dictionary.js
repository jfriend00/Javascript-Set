"use strict";
//---------------------------------------------------------------------------------------
// Dictionary
// 
// This is an object with the same function as a Set(), but
//   it stores a value with each item in the Set (kind of like a dictionary)
// This works only with items that either are strings or have a .toString() method that
// returns a unique value.
//
// This has the exact same API as the Set object except for:
// 1) .add has been changed to accept the value
//    .add(key, value)
//    .add(Dictionary)
//    .add({key1: value1, key2: value2})
//
// 2) .get(key) is a new method that retrieves the value associated with a key
//
// 3) .keys() returns the string converted version of the keys, not the original
//        you could then get each corresponding value by calling .get(key)
//
// 4) .find() does a brute force search for a particular value and 
//    returns the key of the first matching value or null
//    Comparisons are done with === (so no type conversion)
//
// 5) .values() returns an array of all the values
//
// 6) .each(fn)
//        the callback is passed fn(value, key)
//---------------------------------------------------------------------------------------
function Dictionary(initialData) {
    // call parent constructor
    Set.apply(this, arguments);
}

(function() {
    // inherit from Set
    var proto = Dictionary.prototype = new Set();
    var base = Set.prototype;
    // Set constructor back to us
    proto.constructor = Dictionary;

    // override of the base class .add()
    // add(key, value)
    // add(Dictionary)
    // add({key1: value1, key2: value2})
    proto.add = function(arg1, arg2) {
        if (arg1 instanceof Set) {
            // call base class to just add another Set
            base.add.call(this, arg1);
        } else if (typeof arg1 === "object") {
            // cycle through the object and add all properties/values to the Set
            for (var prop in arg1) {
                if (arg1.hasOwnProperty(prop)) {
                    this._add(prop, arg1[prop]);
                }
            }
        } else if (typeof arg2 !== "undefined") {
            // must be add(key, value)
            this._add(arg1, arg2);
        }
        return this;
    }

    proto.get = function(key) {
        return this.data[key];
    }

    // override that collects just the string keys, not the values
    proto.keys = function() {
        var results = [];
        this.each(function(data, key) {
            results.push(key);
        });
        return results;
    }

    // return an array of all the values
    proto.values = function() {
        var results = [];
        this.each(function(data, key) {
            results.push(data);
        });
        return results;
    }

    proto.find = function(value) {
        var found = null;
        this.each(function(val, key) {
            if (val === value) {
                found = key;
                return false;       // stop .each() loop
            }
        });
        return found;
    }
})();
