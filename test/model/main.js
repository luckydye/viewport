import TestMaterial from "../../src/materials/TestMaterial";
import Test from "../../src/Test";
import { Geometry } from "../../src/scene/Geometry";
import { Texture } from "../../src/materials/Texture";
import { Resources } from "../../src/Resources";

const resources = {
    'map_model': require('../../res/models/cs_template.obj'),
    'map_texture': require('../../res/textures/test.png'),
}

Test.viewportTest(resources, viewport => {

    const scene = viewport.scene;

    viewport.renderer.background = [0.8, 0.9, 1.0, 1.0];

    const material = new TestMaterial();
    material.texture = new Texture(Resources.get('map_texture'));

    const meshVerts = Loader.loadObjFile(Resources.get('map_model'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: material,
        scale: 3,
        id: 10,
    });
    scene.add(mesh);

});
