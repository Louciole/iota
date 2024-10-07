import { Model, Target } from "../model.mjs"
import { arrayEqual } from "../utils.mjs";

function assert(a, b) {
    if (a !== b)
        throw new Error(`Assertion failed: ${a} !== ${b}`)
}

function test_EmptyModel() {
    // Check that an empty model stays empty
    // after a transaction
    const model = new Model();
    model.begin()
        .commit()

    assert(Object.keys(model._graph._childrenOf).length, 0)
}

function test_InsertNode() {
    // Check that are properly inserted, as children of the root
    const model = new Model();
    model.begin()
        .insert(null, undefined, undefined, "_root")
        .insert(new Target("_root", Target.INSIDE))
        .insert(new Target("_root", Target.INSIDE))
        .insert(new Target("_root", Target.INSIDE))
        .insert(new Target("_root", Target.INSIDE))
        .dump("_root")
        .commit()

    assert(model._graph.childrenOf("_root").length, 4)
}

function test_InsertProto() {
    // Check 
    const model = new Model();
    model.begin()
        .insert(null, undefined, undefined, "_proto")
        .insert(new Target("_proto", Target.INSIDE))
        .insert(new Target("_proto", Target.INSIDE))
        .insert(new Target("_proto", Target.INSIDE))
        .insert(new Target("_proto", Target.INSIDE))
        .dump("_proto")
        .insert(null, undefined, "_proto", "_root")
        .dump("_root")
        .commit()

    assert(model._graph.childrenOf("_root").length, 4)
}

const TESTS = [
    test_EmptyModel,
    test_InsertNode,
    test_InsertProto
]

for (const test of TESTS) {
    try {
        console.log(`Running ${test.name}`)
        test()
        console.log(`Success ${test.name}`)
    } catch (e) {
        console.error(`Failed ${test.name}`)
        console.error(e)
        process.exit(1)
    }
}
