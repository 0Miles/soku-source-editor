import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const configPath = path.join(os.homedir(), '.' + path.basename(app.getPath('exe')) + '.json')

export class ConfigManager<T extends Record<string, any> = Record<string, any>> {
    config: T = {} as T

    constructor() {
        this.loadConfig()
    }

    getConfig(key: string) {
        if (key) {
            return this.config[key]
        } else {
            return this.config
        }
    }  

    updateConfig(patch: Partial<T>) {
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
                this.config = {} as T
            }
        } catch (ex) {
            console.log(ex)
        }
    }
}