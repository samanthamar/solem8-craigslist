const express = require('express'); 
const rp = require('request-promise');
const $ = require('cheerio');
const app = express();
const craigslistParse = require('./craigslistParse');
let count = 0;

app.get('/craigslist', function(req, res) {
  let model = req.query.model.toLowerCase();
  let size = req.query.size.toLowerCase();
  let searchParams = model+"+"+"size"+"+"+size // ie.Yeezy+desert+size+9
  // TODO: 
  // Define location somewhere
  craigslistUrl = 'https://toronto.craigslist.org/search/sss?query='+searchParams+'&sort=rel'
  // request promise
  rp(craigslistUrl)
    // gets the html
    .then((html) => {
      // Get total num of results
      let numTotalResults = parseInt($('.totalcount', html).first().text());
      // Debugging
      console.log("Num of results:" + numTotalResults)
      // Get list of all urls to visit
      let resultsUrls = urls(numTotalResults, searchParams); 
      return resultsUrls; 
  }) 
  .then((urls) => {
      // From each result page, get the urls to each post
      return Promise.all(
        urls.map((url) => {
          count++;
          console.log("-----------------------------------Promise.all count: " + count);
          console.log(url)
          return craigslistParse(url)
        })
      )
  })
  .then((results) => {
      var json = {
        status: 'OK', 
        shoeUrls: results 
      }
      res.send(json);
      console.log('success')
  })
  .catch((error) => {
    // handle this error
    console.log(error)
  })
});

const urls = (numOfResults, searchParams) => {
  // Limited to Toronto
  let baseUrl = 'https://toronto.craigslist.org/search/sss?query='
  let pageUrls = []; 
  // Craigslist lists a max of 120 posts/page
  if (numOfResults < 120){
    pageUrls.push(baseUrl+searchParams+'&sort=rel')
  } else {
    let numPagesToCrawl = Math.floor(numOfResults/120);
    console.log("Pages to crawl: " + numPagesToCrawl)
    for (let i=0; i<=numPagesToCrawl; i++){
      if (i==0) {
        pageUrls.push(baseUrl+searchParams+'&sort=rel')
      } else if (i==1){
        pageUrls.push(baseUrl+searchParams+'&s='+(i*120).toString()+'&sort=rel')
      }
    }

  }
  return pageUrls;
}

const searchParams = (searchTerms) => {
  let searchParam = ""
  let numOfTerms = searchTerms.length 

  for (let i=0; i<numOfTerms; i++) {
    if (i != numOfTerms - 1) {
      searchParam += searchTerm[i] + "+"
    } else {
      searchParam += searchTerm[i]
    }
  }

  return searchParams

};

// Define what port to listen on
app.listen(process.env.PORT || 5000);
module.exports = app;