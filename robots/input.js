const readline = require('readline-sync')
const state = require('./state')

function robot(){
    
    const content = {
        maximumSentences: 7
    }

    content.language = askAndReturnLanguageOfSearch()
    
    if(content.language == false) {
        content.searchTerm  = askAndReturnSearchTermInPortuguese()
        content.prefix = askAndReturnPrefixInPortuguese()
        
    }else{
    content.searchTerm  = askAndReturnSearchTermInEnglish()
    content.prefix = askAndReturnPrefixInEnglish()
    }

    state.save(content)


    function askAndReturnSearchTermInEnglish() {
        return readline.question("\nType a Wikipedia search term: ")
    }
    function askAndReturnSearchTermInPortuguese() {
        return readline.question("\nDigite o que deseja pesquisar: ")
    }

    function askAndReturnPrefixInEnglish() {
        const prefix = ['Who is? ', 'What is? ', 'The history of...']
        const selectedPrefixIndex = readline.keyInSelect(prefix, 'Choose one option: ')
        const selectedPrefixText = prefix[selectedPrefixIndex]

        return selectedPrefixText
    }
    function askAndReturnPrefixInPortuguese() {
        const prefix = ['Quem e?', 'O que e', 'A historia de...']
        const selectedPrefixIndex = readline.keyInSelect(prefix, 'Escolha uma opcao: ')
        const selectedPrefixText = prefix[selectedPrefixIndex]

        return selectedPrefixText
    }

    function askAndReturnLanguageOfSearch() {
        const language = ['Portugues', 'English']
        selectedLanguageIndex = readline.keyInSelect(language,'Choose one language:(Escolha um idioma) ')
        if(selectedLanguageIndex === 0){
            return 'pt'
        }else{
            return 'en'

        }

    }
}


module.exports = robot
