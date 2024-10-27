const { readdirSync, statSync } = require('node:fs');
const pathUtil = require('node:path');

class FileTree {

    constructor(path, name = "", type = null) {
        this.path = path;
        this.name = name;
        this.type = type
        this.items = [];
    }

    build = () => {
        this.items = FileTree.readDir(this.path);
    }

    static readDir(path) {
        var fileArray = [];

        readdirSync(path).forEach(file => {
            var fileInfo = new FileTree(`${path}\\${file}`, pathUtil.basename(file, '.boxnote'));
            var stat = statSync(fileInfo.path);

            if (stat.isDirectory() && !file.endsWith('Images')) {
                fileInfo.type = "dir"
                //fileInfo.items = FileTree.readDir(fileInfo.path);
                fileArray.push(fileInfo);
            } else if (pathUtil.extname(file) == '.boxnote') {
                fileInfo.type = "note"
                fileArray.push(fileInfo);
            }
        })
        return fileArray;
    }
}

module.exports = FileTree;