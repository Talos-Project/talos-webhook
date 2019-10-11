import { assert } from "chai"
import { PluginFactory } from "../src/PluginFactory"
import { GitClientMock } from "./GitClientMock";
import { Plugin } from "../src/interfaces/Plugin";
suite('Plugin Factory', () => {

    const client = new GitClientMock()
    const factory = new PluginFactory(client)

    test('getAvailablePluginNames returns a list names', () => {
        const actual = factory.getAvailablePluginNames()

        assert.isOk(actual)
        assert.isArray(actual)
        assert.isString(actual[0])
    })

    test('make returns plugin', () => {

        const pluginName = factory.getAvailablePluginNames()[0]
        const actual: Plugin<any, any> = factory.make(pluginName);

        assert.isNotNull(actual)
        assert.isObject(actual)
        assert.isFunction(actual.handle)
    })

})