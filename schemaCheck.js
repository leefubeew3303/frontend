const fs = require("fs")
const Ajv = require("ajv")
const ajv = new Ajv()
const schema = require("./schema/chainSchema.json")
const chainFiles = fs.readdirSync("../_data/chains/")

// https://chainagnostic.org/CAIPs/caip-2
const parseChainId = (chainId) =>
  /^(?<namespace>[-a-z0-9]{3,8})-(?<reference>[-a-zA-Z0-9]{1,32})$/u.exec(
    chainId
  )

const filesWithErrors = []
for (const chainFile of chainFiles) {
  const fileLocation = `../_data/chains/${chainFile}`
  const fileData = fs.readFileSync(fileLocation, "utf8")
  const fileDataJson = JSON.parse(fileData)
  const fileName = chainFile.split(".")[0]
  const parsedChainId = parseChainId(fileName)?.groups
  const chainIdFromFileName = parsedChainId?.reference
  if (chainIdFromFileName != fileDataJson.chainId) {
    throw new Error(`File Name does not match with ChainID in ${chainFile}`)
  }
  const valid = ajv.validate(schema, fileDataJson)
  if (!valid) {
    console.error(ajv.errors)
    filesWithErrors.push(chainFile)
  }
}

if (filesWithErrors.length > 0) {
  throw new Error(
    `Invalid JSON Schema in ${
      filesWithErrors.length
    } files at ${filesWithErrors.join(",")}`
  )
}
