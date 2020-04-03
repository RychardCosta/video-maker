const algorithmia  = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')

const algorithmiaKey = require('../credencials/api_key.json').apiKey

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentInToSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaKey)
        const wikipediaAlgorithmia = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
        const languageOfSearchTerm = {
            "articleName": content.searchTerm,
            "lang": content.language
        }
        const algorithmiaResponse  = await wikipediaAlgorithmia.pipe(languageOfSearchTerm)
        const wikipediaContent = algorithmiaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content

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
        content.senteces = []

        const senteces = sentenceBoundaryDetection.sentences(content.sourceContentSanitized) 
        senteces.forEach((sentence) => {
            content.senteces.push({
                text: sentence,
                keywords: [],
                images: []
            })  
        })

        console.log(content.senteces)

    }


}
module.exports = robot