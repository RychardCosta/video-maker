const axios = require('axios')

const state = require('./state')

const googleSearchCredentials = require('../credencials/google-search.json')


async function robot(){

    const content = state.load()

   await fetchGoogleOfAllSentences(content)
   state.save(content)
    

    async function fetchGoogleOfAllSentences(content){
        for(const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}` 
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
   
        }

    }

    async function fetchGoogleAndReturnImagesLinks(query){
        textQuery = query
       const url = 'https://www.googleapis.com/customsearch/v1'
        
        const response = await axios.get(url, {
            params: {
              cx: googleSearchCredentials.searchEngineId,
              q: query,
              searchType:'image',
              imgSize: 'huge',
              num: 2,
              key: googleSearchCredentials.apiKey
              

            }
          })
        
        const imageUrl = response.data.items.map((item) => {
            return item.link
    })

       return imageUrl
     
    }


}

module.exports = robot 