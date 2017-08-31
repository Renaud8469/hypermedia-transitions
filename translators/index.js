const halTranslator = require('./hal_translator')
const sirenTranslator = require('./siren_translator')

module.exports = {
  translateToHal: halTranslator.translate,
  translateToSiren: sirenTranslator.translate
}
