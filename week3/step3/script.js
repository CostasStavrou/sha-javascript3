document.body.onload = function() {

  /* This function checks a URL (passed as a string). It returns true
     if it starts with http:// or https:// or false otherwise */
  var _checkWebProtocol = function(str) {
    str = "" + str;    // make sure str is a string;
    if ((str.match(/^http:\/\//i) !== null) || (str.match(/^https:\/\//i) !== null))
      return true;
    else return false;
  }

  function _addProxyToOverrideCORS(url) {
    return ("https://cors.now.sh/" + url);
  }

  function _relativeURLtoAbsolute(url) {
    var fetchURL = document.getElementById("URLField").value;
    var URLScheme = "https://";
    if (fetchURL.slice(0, 7) === "http://") {
      URLScheme = "http://";
      fetchURL = fetchURL.slice(7, fetchURL.length);
    } else {
      URLScheme = "https://";
      fetchURL = fetchURL.slice(8, fetchURL.length);
    }
    // Now the original fetchURL is split in two parts: the URLscheme and fetchURL
    if (fetchURL.search("/") === (-1)) {
      // fetchURL example: www.example.com
      fetchURL = fetchURL + "/";
    } else if (fetchURL.slice(fetchURL.length - 1) === "/") {
      // fetchURL example: www.example.com/
      // or www.example.com/path/
    } else {
      var splitFetchURL = fetchURL.split("/");
      var lastPart = splitFetchURL[splitFetchURL.length - 1];
      if (lastPart.search(".") === (-1)) {
        // fetchURL example: www.example.com/path
        fetchURL = fetchURL + "/";
      } else {
        // fetchURL example: www.example.com/path/file.html
        // or www.example.com/file.html
        splitFetchURL[splitFetchURL.length - 1] = "";
        fetchURL = splitFetchURL.join("/");
      }
    }

    fetchURL = URLScheme + fetchURL;
    // Now fetchURL is always like http://www.example.com/path/
    if (url.charAt(0) === "/") url = url.slice(1, url.length);
    return fetchURL + url;
  }

  function _convertDocumentStringToArray(str) {
    var documentArray = [];
    var slice = "";
    var char;
    var comment = false;  // This is a flag if we are in a comment
    var openTag = false;  // This flag is that we started a tag
    for (var i = 0; i < str.length; i++) {
      char = str.charAt(i);
      switch (true) {
        case (char === "\n"):
        case (char === "\t"):
          break;
        case ((char === "<") && (comment === false)):
          if (slice.length > 0) documentArray.push({ "data": slice });
          openTag = true;
          slice = "<";
          break;
        case ((char === ">") && (comment === false) && (openTag === true)):
          slice += ">";
          documentArray.push({ "tag": slice });
          openTag = false;
          slice = "";
          break;
        case ((char === "-") && (slice === "<!-")):
          comment = true;
          openTag = false;
          slice += char;
          break;
        case ((comment === true) && (char === ">")):
          slice += char;
          if ((slice.length > 2) && (slice.substring(slice.length - 3) === "-->")) {
            comment = false;
            documentArray.push({ "comment": slice });
            slice = "";
          }
          break;
        default:
          slice += char;
          break;
      }
    }
    return documentArray;
  }

  function howManyHeaderOneTags(arr) {
    var arr2 = arr.filter(function(item) {
      if (("tag" in item) && (item.tag.slice(0, 3) === "<h2"))
        return item;
    });
    return arr2.length;
  }

  function howManyImages(arr) {
    var arr2 = arr.filter(function(item) {
      if (("tag" in item) && (item.tag.slice(0, 4) === "<img"))
      return item;
    });
    return arr2.length;
  }

  function listWithAnchorTags(arr) {
    var links = [];
    var message = "";
    for (var i = 0; i < arr.length; i++) {
      if (("tag" in arr[i]) && (arr[i].tag.slice(0, 3) === "<a ")) {
        message += arr[i].tag;
        while(i < arr.length) {
          i++;
          if (("tag" in arr[i]) && (arr[i].tag.slice(0, 4) === "</a>"))
            break;
          if ("tag" in arr[i]) message += arr[i].tag;
          if ("data" in arr[i]) message += arr[i].data;
        }
        message += "</a><br>";
      }
    }
    return message;
  }

  function listEmailAddresses(arr) {
    // This is too verbose for clarity... Of course this is NOT the best
    // way to extract this information.

    // Convert the items from objects to Strings
    var arr2 = arr.map(function(item) {
      if ("tag" in item) return item.tag;
      if ("data" in item) return item.data;
      if ("comment" in item) return undefined;
    });
    // Pick only the a open tags.
    arr2 = arr2.filter(function(item) {
      if ((!!item) && (item.slice(0, 3) === "<a ")) return true;
    });
    // Pick only those with a mailto: URL
    arr2 = arr2.filter(function(item) {
      if (item.match(/mailto:/i)) return true;
    });
    // Break those in parts
    arr2 = arr2.map(function(item) {
      item = item.split(" ");
      return item;
    });
    // Select only the href attribute parts
    arr2 = arr2.map(function(item) {
      item = item.filter(function(element) {
        if (element.slice(0, 4) === "href") return true;
      });
      return item[0];
    });
    // Finally extract the mail addresses
    var mailAddresses = arr2.map(function(item) {
      var begin = 13;
      var end = item.indexOf(item.charAt(5), 6);
      return item.slice(begin, end);
    });
    return "<p>" + mailAddresses.join(",<br>") + "</p>";
  }

  function findExternalJavascriptFiles(arr) {
    // This is too verbose for clarity... Of course this is NOT the best
    // way to extract this information.

    // Convert the items from objects to Strings
    var arr2 = arr.map(function(item) {
      if ("tag" in item) return item.tag;
      if ("data" in item) return item.data;
      if ("comment" in item) return undefined;
    });
    // Pick only the open script tags.
    arr2 = arr2.filter(function(item) {
      if ((!!item) && (item.slice(0, 8) === "<script ")) return true;
    });
    // Break those in parts
    arr2 = arr2.map(function(item) {
      item = item.split(" ");
      return item;
    });
    // Select only the href attribute parts
    arr2 = arr2.map(function(item) {
      item = item.filter(function(element) {
        if (element.slice(0, 3) === "src") return true;
      });
      return item[0];
    });
    // Filter the undefined
    arr2 = arr2.filter(function(item) {
      if (!!item) return true;
    });
    // Remove trailing greater than sign, if any, and attribute name in the beginning
    arr2 = arr2.map(function(item) {
      if (item.slice(item.length - 1) === ">") {
        item = item.replace(">", "");
      }
      if (item.slice(0, 4) === "src=") {
        item = item.replace("src=", "");
      }
      var quotationMark = item.charAt(0);
      item = item.replace(quotationMark, "");
      item = item.replace(quotationMark, "");
      return item;
    });
    // Make strings absolute
    var externalJavascriptFiles = arr2.map(function(item) {
      if ((item.slice(0,7) === "http://") || (item.slice(0,8) === "https://")) {
        // do nothing
      } else if (item.slice(0,2) === "//") { // example:  //server/path/file.js
        item = "http:" + item;
      } else {
        item = _relativeURLtoAbsolute(item);
      }
      console.log(item);
      return item;
    });
    // Convert to HTML fragment
    var HTMLFragment = externalJavascriptFiles.reduce(function(acc, item) {
      return (acc + "<a href='" + item + "'>" + item + "</a><br>");
    }, "<p>");
    return HTMLFragment + "</p><br><hr><br>";
  }

  function findAriaTags(arr) {
    // FIXME Most of the following steps are the same as in the other
    // functions. I could make it a private function to not repeat them
    // but I leave it like it is to make the steps easier to follow

    // Pick only the tags.
    arr = arr.filter(function(item) {
      if ("tag" in item) return true;
    });
    // Convert the items from objects to Strings
    arr = arr.map(function(item) {
      return item.tag;
    });
    // Break those in parts
    var arr2 = arr.map(function(item) {
      item = item.split(" ");
      return item;
    });
    // Select only the role OR aria attribute parts. If an element has both we count it
    // as one element using aria roles...
    var arr3 = arr2.map(function(item) {
      item = item.filter(function(element) {
        if ((element.slice(0, 4) === "role") || (element.slice(0, 4) === "aria")) return true;
      });
      return item[0];
    });
    // Filter the undefined
    arr3 = arr3.filter(function(item) {
      if (!!item) return true;
    });
    return arr3.length;
  }

  var processDocument = function(documentStr) {
    var documentArray = _convertDocumentStringToArray(documentStr);
    var outputElement = document.getElementById("output");
    var h1Number = howManyHeaderOneTags(documentArray);
    outputElement.innerHTML += ("<p>The document has: " + h1Number + " H1 elements.</p>");
    var imgNumber = howManyImages(documentArray);
    outputElement.innerHTML += ("<p>The document has: " + imgNumber + " images.</p>");
    outputElement.innerHTML += "<hr><p>It has the following links:</p><br>";
    outputElement.innerHTML += listWithAnchorTags(documentArray);
    outputElement.innerHTML += "<br><hr><p>It has the following e-mail addresses:</p><br>";
    outputElement.innerHTML += listEmailAddresses(documentArray);
    outputElement.innerHTML += "<br><hr><p>It loads the following JavaScript files:</p><br>";
    outputElement.innerHTML += findExternalJavascriptFiles(documentArray);
    outputElement.innerHTML += "<br><p>It has ARIA tags in:" + findAriaTags(documentArray) + " elemetns.</p>";
  }

  document.getElementById("fetchURL").addEventListener("click", function(e) {
    e.preventDefault();
    // Reset the results view
    document.getElementById("output").innerHTML = "<h1>Results</h1>";

    var url = document.getElementById("URLField").value;
    if (_checkWebProtocol(url) === false) {
      url = "http://" + url;
      document.getElementById("URLField").value = url;
    }
    var documentStr;
    fetch(_addProxyToOverrideCORS(url)).then(function(responseObj) {
      return responseObj.text();
    }).then(processDocument);
  });

}
