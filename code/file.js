import localforage from 'localforage'
import Encrypt from './encrypt'
import cuid from 'cuid'

import * as settings from './settings'

class File {

    init() {
        return new Promise(resolve => {
            localforage.config({ name: settings.name, storeName: settings.name })
            if (settings.clearStorage) {
                localforage.clear()
                this.erase()
                resolve()
            } else if (settings.level !== false) {
                this.temporary(settings.level)
            } else {
                localforage.getItem('data', (err, saved) => {
                    if (saved) {
                        try {
                            this.data = JSON.parse(Encrypt.decrypt(saved, settings.encrypt))
                            if (this.data.storageVersion !== settings.storageVersion) {
                                this.upgradeStorage()
                            }
                            if (settings.noSave) {
                                this.data.temporary = true
                            }
                            resolve()
                        } catch (e) {
                            console.warn('erasing storage because of error in file...', e)
                            this.erase()
                            resolve()
                        }
                    } else {
                        this.erase()
                        resolve()
                    }
                })
            }
        })
    }

    async erase() {
        this.data = {
            version: settings.storageVersion,
            level: 0,
            sound: 1,
            user: cuid(),
        }
        await this.save()
    }

    temporary(level) {
        this.data = {
            level,
            sound: 1,
            temporary: true,
        }
    }

    async save() {
        if (!this.data.temporary) {
            return new Promise(resolve => {
                localforage.setItem('data', Encrypt.encrypt(JSON.stringify(this.data), settings.encrypt), resolve)
            })
        }
    }

    upgradeStorage() {}
}

export const file = new File()