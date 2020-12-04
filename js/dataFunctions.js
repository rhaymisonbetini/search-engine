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