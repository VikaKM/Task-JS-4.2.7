const input = document.querySelector(".search");
const result = document.querySelector(".results");
let controller;

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), debounceTime);
  };
};

function addRepository(elem) {
    let name = elem.name;
    let owner = elem.owner.login;
    let stars = elem.stargazers_count;
    const elemList = document.createElement("li");
    elemList.classList.add("user_list")
    const elemName = document.createElement("p");
    elemName.textContent = `Name: ${name}`;
    const elemOwner = document.createElement("p");
    elemOwner.textContent = `Owner: ${owner}`;
    const elemStars = document.createElement("p");
    elemStars.textContent = `Stars: ${stars}`;

    elemList.appendChild(elemName);
    elemList.appendChild(elemOwner);
    elemList.appendChild(elemStars);

    const cross = document.createElement("div");
    cross.classList.add("cross");
    cross.onclick = () => elemList.remove();

    elemList.appendChild(cross);

    document.querySelector(".repo_list").appendChild(elemList);    
}


async function searchRepositories(query) {
  result.innerHTML = "";
  query = query.trim();
  if (!query || query.length < 2) return;

  if (controller) controller.abort();
  controller = new AbortController();

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`,
      {
        signal: controller.signal,
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    data.items.forEach(repo => {
      const li = document.createElement("li");
      li.classList.add("seach_repo");
      li.textContent = repo.name;
      li.onclick = () => {
        addRepository(repo);
        input.value = "";
        result.innerHTML = "";
    };
      result.appendChild(li);
    });
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
    }
  }
}

const debouncedSearch = debounce(searchRepositories, 500);

input.addEventListener("input", (e) => debouncedSearch(e.target.value));
