// Regenerates the areaIds constant in app.js from a willhaben search page payload.
// See "Regenerating the area IDs" in README.md for how to obtain the input file.

const fs = require('fs')

const stateIdToName = {
    1: 'burgenland',
    2: 'kaernten',
    3: 'niederoesterreich',
    4: 'oberoesterreich',
    5: 'salzburg',
    6: 'steiermark',
    7: 'tirol',
    8: 'vorarlberg',
    900: 'wien',
    22000: 'andereLänder'
}

/**
 * normalizes a district label into a property name
 * @param {string} label the district label as shown on willhaben
 * @returns {string} the normalized property name
 */
function normalize(label) {
    return label.toLowerCase()
        .replaceAll('ü', 'ue')
        .replaceAll('ö', 'oe')
        .replaceAll('ä', 'ae')
        .replaceAll('ß', 'ss')
        .replaceAll('-', '_')
        .replaceAll(' ', '_')
        .replaceAll(',', '')
        .replaceAll('.', '')
}

/**
 * builds the area ID map from the navigator groups of a search page
 * @param {object} navigatorGroups the navigatorGroups array of the search result
 * @returns {object} the area IDs grouped by state
 */
function buildAreaIds(navigatorGroups) {
    const districtNavigator = navigatorGroups
        .flatMap(group => group.navigatorList || [])
        .find(navigator => navigator.id === 'district')

    if (!districtNavigator) throw new Error('no "district" navigator found in the payload')

    const areaIds = {}
    Object.entries(stateIdToName).forEach(([id, name]) => {
        areaIds[name] = { all: +id }
    })

    districtNavigator.groupedPossibleValues[0].possibleValues.forEach(value => {
        const stateName = stateIdToName[value.parent.urlParamRepresentationForValue[0].value]
        if (!stateName) return
        areaIds[stateName][normalize(value.label)] = value.urlParamRepresentationForValue[0].value
    })

    return areaIds
}

const [inputPath, outputPath = './areaIds.json'] = process.argv.slice(2)

if (!inputPath) {
    console.error('usage: node tools/extractAreaIds.js <input.json> [output.json]')
    process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const navigatorGroups = Array.isArray(payload)
    ? payload
    : payload.props.pageProps.searchResult.navigatorGroups

fs.writeFileSync(outputPath, JSON.stringify(buildAreaIds(navigatorGroups), null, 4))
console.log(`wrote ${outputPath}`)
