document.body.onload = function() {

  /* Declare message types.
     Here we declare the message types. We assign them
     to elements whenever is possible (for example during
     creation and addition of an element to the document)
  */
  var CNGU = 'create new Github user';

  // This can be added here since these elements are part of the document since the beginning
  document.getElementById("submitUsername").setAttribute("messageType", CNGU);

  // We use only one event listener for performance reasons
  document.body.addEventListener("click", eventController);

  // This stores the user.
  var gitUser;

  function eventController(e) {
    // traverse from target until body to find first DOM element with messageType
    var _findMessageTypeAndNode = function(begin, end = document.body) {
      var obj = {};
      obj.node = begin;
      obj.message = obj.node.getAttribute("messageType");

      while (obj.node !== end) {
        if (obj.message) break;
        obj.node = obj.node.parentNode;
        obj.message = obj.message || obj.node.getAttribute("messageType");
      }
      return obj;
    }

    var messageTypeAndNode = _findMessageTypeAndNode(e.target);

    //var messageType = e.target.getAttribute("messageType");
    var url = "";
    switch (messageTypeAndNode.message) {
      case CNGU:
        e.preventDefault();
        var username = document.getElementById("usernameField").value;
        // Remove ? characters from the provided username.
        username = username.replace(/\x3f/g, "");
        gitUser = new GitHubUser(username);
        gitUser
            .getUserInformation()
            .then((function(informations){
                this.user = informations;
                return this.getRepos();
            }).bind(gitUser))
            .then((function(repos) {
// We don't need the following since this.repos allready contains the data
//                this.repos = repos;

                Render('.githubView', this.render());
}).bind(gitUser));

        document.getElementById("landing_page").className = "hide";
        document.getElementById("page").className = "show";
        break;
      case null:
         console.log(e.target);
      default:
        // do nothing. there is no message type
    }
  }


/*
  This is the GitHubUser function. It returns an object. It does not add
  elements to the DOM. This is done by the Render function. But it has a
  render method that returns a string with everything to be added to the DOM.
*/
  function GitHubUser(username) {
    this.username = username;
    console.log("Create user: " + this.username);
    this.user = null;
  }

  GitHubUser.prototype.getUserInformation = function () {
    this.summaryUrl = "https://api.github.com/orgs/" + this.username + "/repos";
    console.log("Fetch summary information for user: " + this.username + " from: " + this.summaryUrl);
    return makeRequest(this.summaryUrl);
  };

  GitHubUser.prototype.getRepos = function() {
    console.log("Get detailed information for user: " + this.username);
    this.repos = [];
    this.repoUrls = this.user.map(elem => elem.url);
    var thePromises = this.repoUrls.map(function(item, index) {
      item = makeRequest(item);
      item.then((function(data) {
        this.repos[index] = data;
      }).bind(gitUser)).catch(function(data) {
        this.repos[index] = data;
      });
      return item;
    });
	console.log("We return with Promise.all");
    return Promise.all(thePromises);
  };

  GitHubUser.prototype.render = function () {
      // Here return a string, be fancy and use map && reduce
	  console.log("We enter this.render");
    var markupTable = this.repos.map(function(elem) {
      var name = elem.name;
      var url = elem.html_url;
      var description = elem.description;
      var stars = elem.stargazers_count;
      var forks = elem.forks_count;
      elem = `
      <section>
        <h4><a href="${url}">${name}</a></h4>
        <p>${description}</p>
        <p>stars: ${stars}<br>
           forks: ${forks}</p>
      </section>
      `;
      return elem;
    });
    var markup = `<div class="repositories">`;
    markup += markupTable.reduce((acc, item) => { return acc += item; }, "");
    markup += `</div>`;
	  	  console.log("We exit this.render");
    return markup;
  }

  function Render(element, html) {
    var container = document.querySelector(element);
	console.log(element);
	console.log(html);
    container.innerHTML = html;
  }
/*
   This function just makes the request. It calls back the provided
   callback function with a boolean value expressing success or
   failure and the response data (for success or failure).

   FIXME
   This does not examine the xhr.responseText value. There are responses
   like NOT ALLOWED (because of Rate limiting for example) that I should
   take care.
*/
  function makeRequest(url) {
    var xhrPromise = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
    return xhrPromise;
  }

};
