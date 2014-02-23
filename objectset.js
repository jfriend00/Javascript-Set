//---------------------------------------------------------------------------------------
// objectSet
// 
// This is an object with the same function as a set(), but
//   it accepts objects as set keys and will work with JS objects or DOM objects
// There are three ways the key will be obtained:
//    1) If the ._objectSetKey property already exists on the object, that will be used
//    2) If the `.toKey()` method exists on the object, that will be called and
//       its return value will be used as the key.  Note, this method must always
//       return the same string for the same object
//    3) If neither of the above is true, then the ._objectSetKey property will be
//       assigned with a unique id value in it
//---------------------------------------------------------------------------------------
function objectSet(initialData) {
    // call parent constructor with all arguments
    set.apply(this, arguments);
}

(function() {
    // establish who we inherit from
    objectSet.prototype = new set();
    // put constructor back to us
    objectSet.prototype.constructor = objectSet;
    
    // override of _getKey to make sure we get the right string key
    // for an object
    objectSet.prototype._getKey = function(obj) {
        var key;
        if (typeof obj === "string") {
            return obj;
        }
        else if (typeof obj === "object") {
            if (obj._objectSetKey) {
                key = obj._objectSetKey;
            } else if (obj.toKey && typeof obj.toKey === "function") {
                key = obj.toKey();
            } else {
                return null;
            }
        }
        if (!key) {
            // it won't be an object or string type here
            key = obj.toString();
        }
        return key;
    }
    
    // monotomically increasing cntr for assigning unique object IDs
    var objectSetCntr = 1;
    
    // calls _getKey to see if there is already a key
    // if there isn't already a key and this is an object, then we define a unique key for the object
    // and assign it to the object so it will not change
    objectSet.prototype._makeKey = function(obj) {
        var key = this._getKey(obj);
        if (!key && typeof obj === "object") {
            // coin a new key and set it on the object
            key = "_uniqueObjId_" + objectSetCntr.toString();
            if (Object.prototype.toString.call(obj) === "[object Object]" && Object.defineProperty) {
                Object.defineProperty(obj, "_objectSetKey", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: key
                });
            } else {
                // no Object.defineProperty or can't use it so just make it an ordinary property
                obj._objectSetKey = key;
            }
            // increment cntr
            ++objectSetCntr;
        }
        return key;
    }
    
    // override to support a nodeList object and let baseclass treat it like an array
    // to add all the objects in it to the set
    objectSet.prototype._isPseudoArray = function(item) {
        // modern browser such as IE9 / firefox / chrome etc.
        var result = Object.prototype.toString.call(item);
        if (result === "[object HTMLCollection]" || result === "[object NodeList]") {
            return true;
        }
        //ie 6/7/8
        if (typeof item !== "object" || !item.hasOwnProperty("length") || item.length < 0) {
            return false;
        }
        // if possible empty nodeList, we want to treat it as a nodeList
        // it will be empty so it won't actually add anything, but then
        // we don't get an empty nodeList object itself in the set
        if (item.length === 0) {
            return true;
        } else if (item[0] && item[0].nodeType) {
            return true;
        }
        return false;        
    }
    
})();