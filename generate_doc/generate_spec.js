const path = require("path");
const fs = require("fs-extra")

const generateSpecArray = (folderPath, root, args, parent) => {
  const fileName = path.basename(folderPath);
  let result = [];
  const relativePath = path.relative(args.basePath, folderPath)
  const finalPath = path.join("/", relativePath)
  if (finalPath !== root) {
    console.log(relativePath, root, parent)
    parent = parent === root ? undefined : parent;
    result.push({ name: fileName, parent, path: finalPath })
  }

  const stat = fs.statSync(folderPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      const filePath = path.resolve(folderPath, file);
      result = result.concat(generateSpecArray(filePath, root, args, finalPath));
    });
  }
  return result;
}

exports.generateSpecs = (args) => {
  if (args.specFolder) {
    const folderPath = path.resolve(args.basePath, args.specFolder);
    console.log("read spec file from :", folderPath);
    if (fs.pathExistsSync(folderPath)) {
      try {
        const relativePath = path.join("/", path.relative(args.basePath, folderPath))
        const result = generateSpecArray(folderPath, relativePath, args);
        console.log(result)
        return result;
      } catch (e) {
        throw e;
      }
    }
  }
  return [];
}