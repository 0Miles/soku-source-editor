const { app } = require('electron')
const path = require('path')
const fs = require('fs')

const configPath = path.join(os.homedir(), '.' + path.basename(app.getPath('exe')) + '.json')

class ConfigManager {
    constructor() {
        this.loadConfig()
    }

    getConfig(key) {
        if (key) {
            return this.config[key]
        } else {
            return this.config
        }
    }  

    updateConfig(patch) {
        this.config = Object.assign(this.config, patch)
        this.saveConfig()
    }

    saveConfig() {
        fs.writeFileSync(configPath, JSON.stringify(this.config), { encoding: 'utf-8' });
    }

    loadConfig() {
        try {
            if (fs.existsSync(configPath)) {
                const data = fs.readFileSync(configPath, { encoding: 'utf-8' })
                this.config = JSON.parse(data)
            }
            else
            {
                this.config = {}
            }
        } catch (ex) {
            console.log(ex)
        }
    }
}

module.exports = { ConfigManager }