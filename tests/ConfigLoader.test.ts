import { assert } from 'chai';
import { resolve } from 'path'
import { ConfigLoader } from '../src/ConfigLoader'

suite('Tests for ConfigLoader', () => {

    const config = new ConfigLoader(resolve('.talos.yaml')).getConfig()

    test('Config is valid', () => {
        assert.isOk(config)
        assert.isObject(config)
        assert.isObject(config.git)
        assert.isString(config.git.client)
        assert.equal(config.git.client, "talos-gitlab-client")
    })

})