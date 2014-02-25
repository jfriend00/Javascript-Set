"use strict";

function runSamples(elem) {

    elem = document.getElementById(elem);

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
        o.innerHTML = str;
        elem.appendChild(o);
    }
    
    function summarize(title, input, results) {
        output(title, " ", input, " , ", results);
    }
    
    // Code examples for the various Set and Dictionary Objects

    // Get a list of all unique items (no duplicates) in an array
    output("<hr>Samples");

    function removeDups(data) {
        var set = new Set(data);
        return set.keys();
    }
    
    var data = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,11,22,33,44,11,0];
    var results = removeDups(data);
    summarize("removeDups:", data, results);
    
    function randomValues(low, high, num) {
        var values = new Set();
        while (num > 0) {
            var random = Math.floor((Math.random() * (high - low)) + low);
            if (!values.has(random)) {
                values.add(random);
                --num;
            }
        }
        return values.keys();
    }
    
    var results = randomValues(1, 100, 25);
    summarize("list of 25 unique random integers 1-100", "", results);
    
    function dealCards(n) {
        var remainingCards = new Set();
        var suits = ["S", "D", "H", "C"];
        for (var suit = 0; suit < suits.length; suit++) {
            for (var val = 1; val <= 13; val++) {
                remainingCards.add(suits[suit] + val);
            }
        }
        var dealtCards = [];
        var cards = remainingCards.keys();
        var indexes = randomValues(0, cards.length, n);
        for (var i = 0; i < indexes.length; i++) {
            var card = cards[indexes[i]];
            dealtCards.push(card);
            remainingCards.remove(card);
        }
        return {dealtCards: dealtCards, remainingCards: remainingCards};
    }
    
    results = dealCards(13);
    summarize("deal 13 cards", results.dealtCards, results.remainingCards);
    

    
}