"use strict";
//---------------------------------------------------------------------------------------
// ObjectSet
// 
// This is an object with the same function as a Set(), but
//   it accepts objects as Set keys and will work with JS objects or DOM objects
// There are three ways the key will be obtained:
//    1) If the ._objectSetKey property already exists on the object, that will be used
//    2) If the `.toKey()` method exists on the object, that will be called and
//       its return value will be used as the key.  Note, this method must always
//       return the same string for the same object
//    3) If neither of the above is true, then the ._objectSetKey property will be
//       assigned with a unique id value in it
//
// The constructor supports an optional config object as the first argument
// The properties the config objects supports are:
//     keyStoragePropertyName (defaults to "_objectSetKey")
//     keyMethodName (defaults to "toKey")
//         method on the object that is called to convert the object 
//         to a unique string key
//     keyFunctionName (not used by default if not present)
//         function that is called to convert the object
//         to a unique string key.  The function is passed the object
//         in question.  Use this is you don't want to add a method
//         to all the objects
//---------------------------------------------------------------------------------------
function objectSet(config, initialData) {
    // make copy of arguments so we can modify it
    var args = Array.prototype.slice.call(arguments, 0);
    
    // initialize default config object
    this.config = {
        keyStoragePropertyName: "_objectSetKey",
        keyMethodName: "toKey"
    }
    
    // check to see if a config object was passed
    if (typeof config === "object" && !Array.isArray(config) && !this._isPseudoArray(config)) {
        // copy properties from config object to instance data
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                this.config[prop] = config[prop];
            }
        }
        // remove config object from args
        args.shift();
    }
    // call parent constructor with all arguments
    // except config object
    Set.apply(this, args);
}

(function() {
    // establish who we inherit from
    var proto = objectSet.prototype = new Set();
    
    // put constructor back to us
    proto.constructor = objectSet;
    
    // override of _getKey to make sure we get the right string key
    // for an object
    proto._getKey = function(obj) {
        var key;
        var fn = this.config.keyMethodName;
        var keyProp = this.config.keyStoragePropertyName;
        var keyFn = this.config.keyFunctionName;
        
        if (typeof obj === "string") {
            return obj;
        } else if (typeof obj === "object") {
            if (obj[keyProp]) {
                key = obj[keyProp];
            } else if (obj[fn] && typeof obj[fn] === "function") {
                key = obj[fn]();
            } else if (keyFn) {
                key = keyFn(obj);
            } else {
                // explicitly don't allow the object type to use .toString() because
                // the default implementation for an object doesn't work
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
    proto._makeKey = function(obj) {
        var key = this._getKey(obj);
        var keyProp;
        if (!key && typeof obj === "object") {
            keyProp = this.config.keyStoragePropertyName;
            // coin a new key and Set it on the object
            key = "_uniqueObjId_" + objectSetCntr.toString();
            // only use Object.defineProperty on actual JS objects, not on DOM objects
            if (Object.prototype.toString.call(obj) === "[object Object]" && Object.defineProperty) {
                Object.defineProperty(obj, keyProp, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: key
                });
            } else {
                // no Object.defineProperty or can't use it so just make it an ordinary property
                obj[keyProp] = key;
            }
            // increment cntr
            ++objectSetCntr;
        }
        return key;
    }
    
    // override to support a nodeList object and let baseclass treat it like an array
    // to add all the objects in it to the Set
    proto._isPseudoArray = function(item) {
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
        // we don't get an empty nodeList object itself in the Set
        if (item.length === 0) {
            return true;
        } else if (item[0] && item[0].nodeType) {
            return true;
        }
        return false;        
    }
    
    // makes a new empty Set of the same type and configuration as this one
    // override of base class to add support for config
    proto.makeNew = function() {
        var newSet = new this.constructor(this.config);
        if (arguments.length) {
            newSet.add.apply(newSet, arguments);
        }
        return newSet;
    }
    
    
})();