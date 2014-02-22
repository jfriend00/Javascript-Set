function runSetTests(elem) {

    var indentLevel = 0;
    var indentPerLevel = 20;
    function output(/* one or more args */) {
        var str = "", item;
        for (var i = 0; i < arguments.length; i++) {
            item = arguments[i];
            if (typeof item === "string") {
                str += item;
            } else if (item instanceof set) {
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
        if (typeof t === "boolean") {
            if (s === t) {
                return null;
            } else {
                return ["operation did not return expected result: " + s + " !== " + t];
            }
        }
        // verify that s contains exactly the keys in the array t
        // we could use set features more easily to test this, but
        // we don't want to use sets themselves to test sets, so
        // we go brute force here
        var keys = s.keys();
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
            errors.push("set length is not what was expected: " + keys.length + " !== " + t.length);
        }
        if (extra.length) {
            errors.push("set contains extra keys: " + JSON.stringify(extra));
        }
        if (missing.length) {
            errors.push("set is missing keys: " + JSON.stringify(missing));
        }
        if (errors.length) {
            return errors;
        }
        return null;
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
        var x = new set();
        x.add(1).add(2,3,4).add([5,6,7],8).add(new set(9));
        verify(".add()", x, [1,2,3,4,5,6,7,8,9]);
        
        // test .remove()
        x.remove(2).remove([3,4]).remove(5,6);
        verify(".remove()", x, [1,7,8,9]);
        
        // test .has()
        verify(".has(9)", x.has(9), true);
        verify(".has(2)", x.has(2), false);
        
        // test .isEmpty()
        verify(".isEmpty() - 1", x.isEmpty(), false);
        var y = new set().add(1).remove(1);
        verify(".isEmpty() - 2", y.isEmpty(), true);

        // test .clear()
        y.add([1,2,3]);
        y.clear();
        verify(".clear()", y.isEmpty(), true);
        
        // test .union()
        x = new set([1,2,3,4,5]);
        y = new set([5,6,7,8,9]);
        var z = x.union(y);
        verify(".union()", z, [1,2,3,4,5,6,7,8,9]);
        
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
        x = new set([1,2,3,4,5]);
        y = new set([1,2,3]);
        z = new set([1,2,3,4,5,6]);
        verify(".isSubset() - 1", x.isSubset(y), false);
        verify(".isSubset() - 2", x.isSubset(z), true);
        z = new set();
        verify(".isSubset() - 3", z.isSubset(x), true);
        
        // test.isSuperset()
        x = new set([1,2,3,4,5]);
        y = new set([1,2,3]);
        z = new set([1,2,3,4,5,6]);
        verify(".isSuperset() - 1", x.isSuperset(y), true);
        verify(".isSuperset() - 2", y.isSuperset(x), false);
        verify(".isSuperset() - 3", z.isSuperset(y), true);
        
    } catch(e) {
        output("Error: ", e.message);
        throw e;
    }
    
}
