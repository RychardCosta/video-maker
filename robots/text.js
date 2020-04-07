const algorithmia  = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
const algorithmiaKey = require('../credencials/api_key.json').apiKey
const  watsonApi = require('../credencials/watson-nlu.json')
 
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApi.apikey,
  version: '2018-04-05',
  url: watsonApi.url
}); 

const state = require('./state')


async function robot() {

    console.log('> [text-robot] Starting...')


    content = state.load()

    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentInToSentences(content)
    limiteMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    
  

    async function fetchContentFromWikipedia(content) {
        console.log('> [text-robot] Fetching content from Wikipedia')
        const algorithmiaAuthenticated = algorithmia(algorithmiaKey)
        const wikipediaAlgorithmia = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
        const languageOfSearchTerm = {
            "articleName": content.searchTerm,
            "lang": content.language
        }
        const algorithmiaResponse  = await wikipediaAlgorithmia.pipe(languageOfSearchTerm)
        const wikipediaContent = algorithmiaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content

        console.log('> [text-robot] Fetching done!')


    }

    function sanitizeContent(content) {
        const withoutBrankLinesAndMarkdown = removeBrankLineandMarkdown(content.sourceContentOriginal)
        const withoutDateInParentheses = removeDateInParentheses(withoutBrankLinesAndMarkdown)
        
        content.sourceContentSanitized = withoutDateInParentheses

        function removeBrankLineandMarkdown(text){
            const allLines = text.split('\n')   

            const withoutBrankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            
            })
            
            return withoutBrankLinesAndMarkdown.join(' ')

        }

        function removeDateInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }

    }

    function breakContentInToSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized) 
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })  
        })
}

    function limiteMaximumSentences(content) {
        return content.sentences = content.sentences.slice(0, content.maximumSentences)

    }

    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                  }
        }, (error, response) => {
            if (error) {
              throw error
            }
            const keywords = response.keywords.map((keyword) => {
                return keyword.text
            })
            resolve(keywords)
            
            })
        })
    }

    async function fetchKeywordsOfAllSentences(content){
        console.log('> [text-robot] Starting to fetch keywords from Watson')


        for (const sentence of content.sentences) {
            console.log(`> [text-robot] Sentence: "${sentence.text}"`)
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
            console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
        }
        
    }


    


}

module.exports = robot