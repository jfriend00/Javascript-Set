"use strict"
function runSetTests(elem) {

    var indentLevel = 0;
    var indentPerLevel = 20;
    function output(/* one or more args */) {
        var str = "", item;
        for (var i = 0; i < arguments.length; i++) {
            item = arguments[i];
            if (typeof item === "string") {
                str += item;
            } else if (item instanceof Set || item instanceof MiniSet) {
                str += JSON.stringify(item.keys());
            } else {
                str += JSON.stringify(item);
            }
        }
        var o = document.createElement("div");
        o.style.marginLeft = (indentLevel * indentPerLevel) + "px";
        o.innerHTML = str;
        elem.appendChild(o);
    }
    
    function outputIndent(level, array) {
        var priorIndent = indentLevel;
        indentLevel = level;
        for (var i = 0; i < array.length; i++) {
            output.call(this, array[i]);
        }
        indentLevel = priorIndent;
    }

    if (typeof elem === "string") {
        elem = document.getElementById(elem);
    }
    
    function _verify(s, t) {
        // forms of input here
        // _verify(Set, array of keys)
        // _verify(array, array)
        // _verify(value, value) - string, number, boolean
        if (s instanceof Set || s instanceof MiniSet || Array.isArray(s)) {
            // if s is a Set, then get its keys
            // if s is not a Set, we assume it to be an array and we just compare s and t as arrays
            var keys;
            if (Array.isArray(s)) {
                keys = s;
            } else {
                keys = s.keys();
            }
            
            // verify that s contains exactly the keys in the array t
            // we could use Set features more easily to test this, but
            // we don't want to use sets themselves to test sets, so
            // we go brute force here
            var missing = [];
            var extra = [];
            var errors = [];
            // verify that every item in keys is in t
            for (var i = 0; i < keys.length; i++) {
                if (t.indexOf(keys[i]) < 0) {
                    extra.push(keys[i]);
                }
            }
            // verify that every item in t is in keys
            for (i = 0; i < t.length; i++) {
                if (keys.indexOf(t[i]) < 0) {
                    missing.push(t[i]);
                }
            }
            if (keys.length !== t.length) {
                errors.push("Set length is not what was expected: " + keys.length + " !== " + t.length);
            }
            if (extra.length) {
                errors.push("Set contains extra keys: " + JSON.stringify(extra));
            }
            if (missing.length) {
                errors.push("Set is missing keys: " + JSON.stringify(missing));
            }
            if (errors.length) {
                return errors;
            }
            return null;
        } else {
            if (s === t) {
                return null;
            } else {
                return ["operation did not return expected result: " + s + " !== " + t];
            }
        }
    }
    
    function verify(title, s, t) {
        var ret = _verify(s, t);
        if (!ret) {
            output("Passed: " + title);
        } else {
            output("Failed: " + title);
            outputIndent(1, ret);
        }
    }
    
    // capture all errors so we can show them in the results
    try {
        // test all forms of .add()
        output("Testing MiniSet...");
        var x = new MiniSet();
        x.add(1).add(2,3,4).add([5,6,7],8).add(new MiniSet(9));
        verify(".add()", x, [1,2,3,4,5,6,7,8,9]);
        // try some tough properties with potentially conflicting names
        x.add("hasOwnProperty", "constructor");
        verify(".has('hasOwnProperty')", x.has("hasOwnProperty"), true);
        verify(".has('constructor')", x.has("constructor"), true);
        x.remove("hasOwnProperty", "constructor");
        verify(".remove()", x, [1,2,3,4,5,6,7,8,9]);
        
        // test .remove()
        x.remove(2).remove([3,4]).remove(5,6);
        verify(".remove()", x, [1,7,8,9]);
        
        // test .has()
        verify(".has(9)", x.has(9), true);
        verify(".has(2)", x.has(2), false);
        
        // test .isEmpty()
        verify(".isEmpty() #1", x.isEmpty(), false);
        var y = new Set().add(1).remove(1);
        verify(".isEmpty() #2", y.isEmpty(), true);

        // test .clear()
        y.add([1,2,3]);
        y.clear();
        verify(".clear()", y.isEmpty(), true);
    
        output("Testing Set...");
        // test all forms of .add()
        var x = new Set();
        x.add(1).add(2,3,4).add([5,6,7],8).add(new Set(9));
        verify(".add()", x, [1,2,3,4,5,6,7,8,9]);
        // try some tough properties with potentially conflicting names
        x.add("hasOwnProperty", "constructor");
        verify(".has('hasOwnProperty')", x.has("hasOwnProperty"), true);
        verify(".has('constructor')", x.has("constructor"), true);
        x.remove("hasOwnProperty", "constructor");
        verify(".remove()", x, [1,2,3,4,5,6,7,8,9]);
        
        // test .remove()
        x.remove(2).remove([3,4]).remove(5,6);
        verify(".remove()", x, [1,7,8,9]);
        
        // test .has()
        verify(".has(9)", x.has(9), true);
        verify(".has(2)", x.has(2), false);
        
        // test .isEmpty()
        verify(".isEmpty() #1", x.isEmpty(), false);
        var y = new Set().add(1).remove(1);
        verify(".isEmpty() #2", y.isEmpty(), true);

        // test .clear()
        y.add([1,2,3]);
        y.clear();
        verify(".clear()", y.isEmpty(), true);
        
        // test .union()
        x = new Set([1,2,3,4,5]);
        y = new Set([5,6,7,8,9]);
        var z = x.union(y);
        verify(".union()", z, [1,2,3,4,5,6,7,8,9]);
        
        // test .hasAll()
        verify(".hasAll() #1", z.hasAll([1,2,3,4,5,6,7,8,9]), true);
        verify(".hasAll() #2", z.hasAll([1,2,3,4,5,6,7,8,9,10]), false);
        verify(".hasAll() #3", z.hasAll([]), true);
        
        verify(".equals() #1", z.equals(new Set([1,2,3,4,5,6,7,8,9])), true);
        verify(".equals() #2", z.equals(new Set([1,2,3,4,5,6,7,8])), false);
        verify(".equals() #3", z.equals(new Set([1,2,3,4,5,6,7,8,9,10])), false);
        verify(".equals() #4", z.equals(new Set()), false);
        
        // test .intersection()
        z = x.intersection(y);
        verify(".intersection()",  z, [5]);
        
        // test .difference()
        z = x.difference(y);
        verify(".difference()", z, [1,2,3,4]);
        
        // test .notInBoth()
        z = x.notInBoth(y)
        verify(".notInBoth()", z, [1,2,3,4,6,7,8,9]);
        
        // test .isSubset() 
        x = new Set([1,2,3,4,5]);
        y = new Set([1,2,3]);
        z = new Set([1,2,3,4,5,6]);
        verify(".isSubset() #1", x.isSubset(y), false);
        verify(".isSubset() #2", x.isSubset(z), true);
        z = new Set();
        verify(".isSubset() #3", z.isSubset(x), true);
        
        // test .isSuperset()
        x = new Set([1,2,3,4,5]);
        y = new Set([1,2,3]);
        z = new Set([1,2,3,4,5,6]);
        verify(".isSuperset() #1", x.isSuperset(y), true);
        verify(".isSuperset() #2", y.isSuperset(x), false);
        verify(".isSuperset() #3", z.isSuperset(y), true);
        
        // test ValueSet
        output("Testing ValueSet...");
        x = new ValueSet({a:1, b:2,c:3});
        y = new ValueSet({d:4});
        x.add(y).add({e:5}).add("f", 6).remove("a");
        verify("ValueSet constructor and .add()", x, ["b", "c", "d", "e", "f"]);
        verify("ValueSet .values()", x.values(), [2,3,4,5,6]);
        verify("ValueSet .get()", x.get("b"), 2);
        verify("ValueSet .find() #1", x.find(3), "c");
        verify("ValueSet .find() #2", x.find(1), null);
        
        // test objectSet with DOM objects
        output("Testing objectSet...");
        var div = document.createElement("div");
        div.innerHTML = "<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>";
        div.id = "testObjectSet";
        div.style.display = "none";
        document.body.appendChild(div);
        var objects = document.querySelectorAll("#testObjectSet li");
        x = new objectSet(objects);
        // try to add duplicates
        x.add(objects[0]).add(objects[1]);
        verify("objectSet .add()", x.keys().length, 5);
        // see if the right objects are in there
        verify("objectSet .has() #1", x.has(objects[0]), true);
        verify("objectSet .has() #2", x.has(document.body), false);
        verify("objectSet .has() #3", x.has({}), false);
        // remove
        x.remove(objects[0]).remove(objects[1]);
        verify("objectSet .remove()", x.keys().length, 3);
        document.body.removeChild(div);
        
        // test objectSet with JS objects that have a toKey() method
        // define an object with .toKey() method
        var testObjCntr = 1;
        var testObj = function() {
            this.toKey = function() {
                return this.id + "";
            }
            this.id = testObjCntr++;
        }
        var list = [];
        for (var i = 0; i < 10; i++) {
            list.push(new testObj());
        }
        x = new objectSet(list);
        verify("objectSet .has() #4", x.has(list[0]), true);
        verify("objectSet .has() #5", x.has(new testObj()), false);
        verify("objectSet .has() #6", x.has(list[9]), true);
        verify("objectSet constructor", x.keys().length, 10);
        x.remove(list[0], list[1]);
        verify("objectSet .remove() #1", x.keys().length, 8);
        var keys = x.keys();
        x.remove(keys[0], keys[1]);
        verify("objectSet .remove() #2", x.keys().length, 6);
        
    } catch(e) {
        output("Error: ", e.message);
        throw e;
    }
    
}
