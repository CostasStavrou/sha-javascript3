document.body.onload = function() {

  // Constants
  // We use this as the first part of the fetch url for a specific repository
  const REPO_PATH = "https://api.github.com/repos/SocialHackersCodeSchool/";
  const CONTRIBUTORS_PATH_BEGIN = "https://api.github.com/repos/SocialHackersCodeSchool/";

  /* Declare message types.
     Here we declare the message types. We assign them
     to elements whenever is possible (for example during
     creation and addition of an element to the document)
  */
  const FRBC = 'fetch repositories button clicked';
  const FDSR = 'fetch data for specific repository';
  const SBCL = 'search button clicked';

  // This can be added here since these elements are part of the document since the beginning
  document.getElementById("submitUsername").setAttribute("messageType", FRBC);
  document.getElementById("searchButton").setAttribute("messageType", SBCL);

  // We use only one event listener for performance reasons
  document.body.addEventListener("click", function(e) {
    eventController(e);
  });

  // This stores the user.
  let gitUser;

  function eventController(e) {
    // traverse from target until body to find first DOM element with messageType
    let _findMessageTypeAndNode = function(begin, end = document.body) {
      let obj = {};
      obj.node = begin;
      obj.message = obj.node.getAttribute("messageType");

      while (obj.node !== end) {
        if (obj.message) break;
        obj.node = obj.node.parentNode;
        obj.message = obj.message || obj.node.getAttribute("messageType");
      }
      return obj;
    }

    let messageTypeAndNode = _findMessageTypeAndNode(e.target);

    //let messageType = e.target.getAttribute("messageType");
    let url = "";
    switch (messageTypeAndNode.message) {
      case FRBC:
        e.preventDefault();
        let username = document.getElementById("usernameField").value;
        // Remove ? characters from the provided username.
        username = username.replace(/\x3f/g, "");
        url = "https://api.github.com/orgs/" + username + "/repos";
        console.log("You want me to fetch summary for user: " + username);
        makeRequest(url, fetchRepositories);
        document.getElementById("landing_page").className = "hide";
        document.getElementById("page").className = "show";
        break;
      case FDSR:
        let repoName = messageTypeAndNode.node.getAttribute("repoName");
        if (document.getElementById(repoName).className !== "repository enabled") {
          console.log("You want me to fetch data for a repository");
          url = REPO_PATH + repoName;
          makeRequest(url, fetchRepoData);
        } else {
          console.log("Close " + repoName);
          let repoEl = document.getElementById(repoName);
          repoEl.removeChild(repoEl.querySelector("div"));
          repoEl.className = "repository";
        }
          break;
        case SBCL:
          let inputField = document.getElementById("searchInput");
          if (document.getElementById("container").children.length === 0) {
            document.getElementById("status").innerHTML = "Fetch repositories first...";
          } else {
            // Retrieve the repositories, since we want locality
            let nodes = document.querySelectorAll(".repository");

            nodes = Array.prototype.slice.call(nodes).reduce(function(acc, item) {
              acc[item.id] = true;
              return acc;
            }, {});

            if (nodes[inputField.value]) {
              document.querySelector("#" +inputField.value).click();
            } else {
              inputField.value = "";
              inputField.placeholder = "Type carefully";
            }
          }
          break;
      case null:
         console.log(e.target);
      default:
        // do nothing. there is no message type
    }
  }


/*
   This function just makes the request. It calls back the provided
   callback function with a boolean value expressing success or
   failure and the response data (for success or failure).

   This does not examine the xhr.responseText value. In case of responses
   like NOT ALLOWED (because of Rate limiting for example), the response
   is transfered to the callback functions (fetchRepositories, fetchRepoData,
   and fetchContributorsData) because I could not examine the whole Github API
   to be absolutely sure that they respond with the same messages when the
   respone is no data, so I wanted to leave a chance for customization.
*/
  function makeRequest(url, callback) {
    let xhrPromise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    })
    .then(function(success) {
      callback(true, success, url);
    })
    .catch(function(failure) {
      callback(false, failure, url);
    });
  }

  function fetchRepositories(successful, payload, url) {
    let container = document.getElementById("container");
    let status = document.getElementById("status");
    payload = JSON.parse(payload);
    if (!successful) {
      status.innerHTML = "The network isn't working... Investigate.";
    } else if (payload.message) {
      status.innerHTML = "We have no network problems but there are no repos returned";
    } else {
      status.innerHTML = "Everything is ok";
      makeRepoStats(payload);
      makeRepositoryElements(payload);
    }
  }

  function fetchRepoData(successful, payload, url) {
    let container = document.getElementById("container");
    let status = document.getElementById("status");
    payload = JSON.parse(payload);
    if (!successful) {
      status.innerHTML = "The network isn't working... Investigate.";
    } else if (payload.message) {
      status.innerHTML = "We have no network problems but there are no repos returned";
    } else {
      status.innerHTML = "Everything is ok";
      fillRepository(payload);
    }
  }

  function fetchContributorsData(successful, payload, url) {
    let status = document.getElementById("status");
    payload = JSON.parse(payload);
    if (!successful) {
      status.innerHTML = "The network isn't working... Investigate.";
    } else if (payload.message) {
      status.innerHTML = "We have no network problems but there are no repos returned";
    } else {
      status.innerHTML = "Everything is ok";
      // Now we want to extract from the url the repository name. This allows us
      // to have this as generic as possible.
      let removeCharacters = CONTRIBUTORS_PATH_BEGIN.length;
      let repoName = url.slice(removeCharacters).split("/")[0];
      fillContributorsSection(payload, repoName);
    }
  }

  function makeRepoStats(data) {
    let statsContainer = document.getElementById("stats");
    let forks = data.reduce((acc, item) => acc + item.forks, 0);
    statsContainer.innerHTML = "<p>Total number of forks for all repositories: " + forks + "</p>";
    if (forks > 0) {
      let maxForksRepo = data.reduce(function(maxForksItem, item) {
        if (item.forks > maxForksItem.forks) {
          maxForksItem = item;
        }
        return maxForksItem;
      }, {forks: 0});
      statsContainer.innerHTML += `<p>Repository with most forks: ${maxForksRepo.name}
        with ${maxForksRepo.forks} forks.</p>`;
    }
  }

  function makeRepositoryElements(data) {
    // for each repository we want a name, the messageType for the event listener,
    // and when we click on the element we should go and fetch data for this repo
    let names = data.map(element => element.name);
    let container = document.getElementById("container");
    container.innerHTML = "";
    names.forEach(name => {
      let repoDiv = document.createElement("div");
      repoDiv.className = "repository";
      repoDiv.id = name;
      repoDiv.setAttribute("messageType", FDSR);
      repoDiv.setAttribute("repoName", name);
      let title = document.createElement("h3");
      title.innerHTML = name;
      title.setAttribute("messageType", FDSR);
      title.setAttribute("repoName", name);
      repoDiv.appendChild(title);
      container.appendChild(repoDiv);
    });
  }

  function fillRepository(data) {
    // 1. get the element using from data.name as Id
    // 2. add description from data.description
    // 3. add contributors
    // 4. add a link to a new tab (webpage) with the repo url data.html_url
    // ...
    let repoElement = document.getElementById(data.name);
    repoElement.className = "repository enabled";
    // repoContainer is a DIV that contains everything except from the title
    let repoContainer = document.createElement("div");
    repoElement.appendChild(repoContainer);

    let p = document.createElement("p");
    p.innerHTML = data.description;
    p.className = "repoDescription";

    // This is to handle messaging
    p.setAttribute("messageType", FDSR);
    p.setAttribute("repoName", data.name);

    repoContainer.appendChild(p);

    console.log("You want me to fetch contributors data for a repository");
    console.log(data.contributors_url);
    let contributorsElement = document.createElement("section");
    repoContainer.appendChild(contributorsElement);

    // This fetches contributors data and fills the elements inside the SECTION
    makeRequest(data.contributors_url, fetchContributorsData);

    let ext_url = document.createElement("a");
    ext_url.href = data.html_url;
    ext_url.target="_blank"
    ext_url.innerHTML = "Read more...";
    ext_url.className = "external_repo_link";
    repoContainer.appendChild(ext_url);
  }

  function fillContributorsSection(data, repoName) {
    let sectionEl = document.querySelector(`#${repoName} section`);
    let sectionTitle = document.createElement("h4");
    sectionTitle.innerHTML = "Contributors";
    sectionEl.appendChild(sectionTitle);

    if (data.length > 0) {
      for (let i=0; i<data.length; i++) {
        let contributorsSection = document.createElement("div");

        let h5El = document.createElement("h5");
        h5El.innerHTML = data[i].login;
        let aEl = document.createElement("a");
        aEl.href = data[i].html_url;
        aEl.appendChild(h5El);
        contributorsSection.appendChild(aEl);
        let imgEl = document.createElement("img");
        imgEl.src = data[i].avatar_url;
        imgEl.alt = "contributor's avatar";
        contributorsSection.appendChild(imgEl);
        let pEl = document.createElement("p");
        pEl.innerHTML = `Contributions so far: ${data[i].contributions}`;
        contributorsSection.appendChild(pEl);
        sectionEl.appendChild(contributorsSection);
      }
    } else {
      let contributorsSection = document.createElement("div");

      let pEl = document.createElement("p");
      pEl.innerHTML = `None so far`;
      contributorsSection.appendChild(pEl);
      sectionEl.appendChild(contributorsSection);
    }
  }

};
