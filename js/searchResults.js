

document.addEventListener('readystatechange', (event) => {
    if (event.target.readyState === 'complete') {
        initApp();
    }
});


const initApp = () => {
    setSearchFocus();
    const search = document.getElementById("search");
    search.addEventListener("input", showClearTextButton);
    const clear = document.getElementById("clear");
    clear.addEventListener("click", clearSearchText);
    clear.addEventListener("keydown", clearPushListener);
    const form = document.getElementById("searchBar");
    form.addEventListener("submit", submitTheSearch);
};


const submitTheSearch = (event) => {
    event.preventDefault();
    deleteSearchResults();
    processTheSearch();
    setSearchFocus();

};


const processTheSearch = async () => {
    clearStatsLine();
    const searchTerms = getSearchTerms();
    if (searchTerms === '') return;
    const resultArray = await retrieveSearchResults(searchTerms);

    if (resultArray.length) buildSearchResults(resultArray);
    setStatsLine(resultArray.length);
}




//searchBar
export const setSearchFocus = () => {
    document.getElementById('search').focus();
}

export const showClearTextButton = () => {
    const search = document.getElementById("search");
    const clear = document.getElementById("clear");
    if (search.value.length) {
        clear.classList.remove("none");
        clear.classList.add("flex");
    } else {
        clear.classList.add("none");
        clear.classList.remove("flex");
    }
};

export const clearSearchText = (event) => {
    event.preventDefault();
    document.getElementById("search").value = "";
    const clear = document.getElementById("clear");
    clear.classList.add("none");
    clear.classList.remove("flex");
    setSearchFocus();
};

export const clearPushListener = (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        document.getElementById("clear").click();
    }
};



//search results
export const deleteSearchResults = () => {
    const parentElement = document.getElementById("searchResults");
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};


export const buildSearchResults = (resultArray) => {

    resultArray.forEach(result => {
        const resultItem = createResultItem(result);
        const resultContents = document.createElement('div');
        resultContents.classList.add("resultContents");

        if (result.img) {
            const resultImg = createResultImage(result);
            resultContents.append(resultImg);
        }

        const resultText = createResultText(result);
        resultContents.append(resultText);
        resultItem.append(resultContents)

        const searchResults = document.getElementById("searchResults");
        searchResults.append(resultItem);

    });

}


const createResultItem = (result) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("resultItem");

    const resultTitle = document.createElement("div");
    resultTitle = document.classList.add("resultTitle");

    const link = document.createElement("a");

    link.href = `httpś://en.wikipedia.org/?curid=${result.id}`;

    link.textContent = result.title;
    link.target = "_blank";
    resultTitle.append(link);
    resultItem.append(resultTitle);

    return resultItem;

}


const createResultImage = (result) => {
    const resultImage = document.createElement("div");
    resultImage.classList.add("resultImage");
    const img = document.createElement("img");
    img.src = result.img;
    img.alt = result.title;
    resultImage.append(img);
    return resultImage;
};



const createResultText = (result) => {
    const resultText = document.createElement("div");
    resultText.classList.add("resultText");
    const resultDescription = document.createElement("p");
    resultDescription.classList.add("resultDescription");
    resultDescription.textContent = result.text;
    resultText.append(resultDescription);
    return resultText;
};


export const clearStatsLine = () => {
    document.getElementById("stats").textContent = "";
};


export const setStatsLine = (numberOfResults) => {
    const statLine = document.getElementById("stats");
    if (numberOfResults) {
        statLine.textContent = `Displaying ${numberOfResults} results.`;
    } else {
        statLine.textContent = "Sorry, no results.";
    }
};

//data function 
export const getSearchTerms = () => {

    const rawSearchTerms = document.getElementById('search').value.trim();
    const regex = /[ ]{2,}/gi;
    const searchTerm = rawSearchTerms.replaceAll(regex, " ");
    return searchTerm;
}


export const retrieveSearchResults = async (searchTerms) => {
    const wikiSearchString = getWikiSearchString(searchTerms);
    const wikiSearchResults = await requestData(wikiSearchString);

    let resultArray = [];

    if (wikiSearchString.hasOwnProperty("query")) {
        resultArray = processWikiResults(wikiSearchResults.query.pages);
    }
    return resultArray;

}

const getWikiSearchString = (searchTerm) => {
    const maxChar = getMaxchar(searchTerm)
    const maxSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChar}&exintro&explaintext&exlimit=max&format=json&origin=*`;
    const searchString = encodeURI(maxSearchString);
    return searchString;

}

const getMaxchar = (searchTerm) => {

    const width = window.innerWidth || document.body.clientWidth;
    let maxChar;

    if (width < 414) maxChar = 65;
    if (width >= 414 && width < 1400) maxChar = 100;
    if (width >= 1400) maxChar = 130;
    return maxChar;

}

const requestData = async (wikiSearchString) => {

    try {
        const response = await fetch(wikiSearchString);
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e)
    }

}

const processWikiResults = (results) => {

    const resultArray = [];

    Object.keys(results).forEach(key => {
        const id = key;
        const title = results[key].title
        const text = results[key].extract
        const img = results[key].hasOwnProperty("thumbnail")
            ? results[key].thumbnail.source : null;

        const item = {
            id: id,
            title: title,
            img: img,
            text: text
        }

        resultArray.push(item);
    })

}